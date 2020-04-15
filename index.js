URLS = undefined;
toggleString = "server1";
cookieIdentifier = "previously_visited_server";
loadVariantURLS = "https://cfw-takehome.developers.workers.dev/api/variants";
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  return new Promise((resolve, reject) => {
    if (!URLS) {
      console.log("fetching URLS");
      fetch(loadVariantURLS)
        .then(data => data.json())
        .then(data => {
          URLS = data["variants"];
        })
        .then(() => {
          resolve(getWebPage(request));
        })
        .catch(err => {
          resolve(
            new Response("Could not variant URLS from " + loadVariantURLS)
          );
        });
    } else {
      console.log("not fetching URLS");
      resolve(getWebPage(request));
    }
  });
}

async function getWebPage(request) {
  let cookieString = request.headers.get("Cookie");
  let predeterminedServer = "";
  let previsitedDate = "";
  if (cookieString) {
    let cookies = cookieString.split(";");
    cookies.forEach(cookie => {
      console.log(cookie);
      let cookieName = cookie.split("=")[0].trim();
      if (cookieName === cookieIdentifier) {
        let val = cookie.split("=")[1];
        predeterminedServer = val.split("?")[0];
        previsitedDate = val.split("?")[1];
      }
    });
  }
  console.log("visited server" + predeterminedServer);
  console.log("visited date" + previsitedDate);
  if (predeterminedServer) {
    toggleString = predeterminedServer;
  } else {
    toggleString = Math.random() < 0.5 ? "server1" : "server2";
  }
  if (toggleString == "server1") {
    let resp = await fetch(URLS[0]).catch(err => {
      new Response("Could not load response of " + URLS[0]);
    });
    resp = await rewriteContent(resp, previsitedDate);
    return setCookie(resp);
  }
  if (toggleString == "server2") {
    let resp = await fetch(URLS[1]).catch(err => {
      new Response("Could not load response of " + URLS[1]);
    });
    resp = await rewriteContent(resp, previsitedDate);
    return setCookie(resp);
  }
}

function getDate() {
  let current_datetime = new Date();
  return current_datetime.toString();
}
function setCookie(response) {
  response = new Response(response.body, response);
  let cookieCreationDate = new Date();
  cookieCreationDate.to;
  response.headers.append(
    "Set-Cookie",
    `${cookieIdentifier}=` + toggleString + "?" + getDate()
  );
  return response;
}

async function rewriteContent(resp, previsitedDate) {
  return new HTMLRewriter()
    .on("h1#title", new ElementHandler())
    .on("p#description", new ElementHandler())
    .on("a#url", new ElementHandler())
    .on("path", new ElementHandler())
    .on("svg", new ElementHandler())
    .on("span", new ElementHandler(previsitedDate))
    .on("div[class*=mt-6]", new ElementHandler(previsitedDate))
    .on("div[class*=bg-green-100]", new ElementHandler())
    .transform(resp);
}

class ElementHandler {
  previsitedDate;
  constructor(date) {
    this.previsitedDate = date;
  }
  element(element) {
    // HTML rewrite done here
    console.log(`Incoming element: ${element.tagName}`);
    switch (element.tagName) {
      case "h1":
        toggleString == "server1"
          ? element.setInnerContent("Linkedin Profile")
          : element.setInnerContent("Github Profile");
        break;
      case "p":
        element.setInnerContent(
          "You can take a look at my Linkedin Profile by clicking the button below"
        );
        toggleString == "server1"
          ? element.setInnerContent(
              "You can take a look at my Linkedin Profile by clicking the button below"
            )
          : element.setInnerContent(
              "You can take a look at my Git Repository by clicking the button below"
            );
        break;
      case "a":
        if (toggleString == "server1") {
          element.setInnerContent("Goto My Linkedin Profile");
          element.setAttribute(
            "href",
            "https://www.linkedin.com/in/deepakanuraag-sathyanarayanan/"
          );
          element.setAttribute("target", "_blank");
          element.setAttribute("style", "background-color:#2867B2");
        } else {
          element.setInnerContent("Goto My Github Profile");
          element.setAttribute("href", "https://github.com/deepakanuraags");
          element.setAttribute("target", "_blank");
          element.setAttribute("style", "background-color:black");
        }
        break;
      case "path":
        if (toggleString == "server1") {
          element.setAttribute("d", linkedinlogo);
          element.setAttribute("style", "fill:#0077B7");
        } else {
          element.setAttribute("d", githublogo);
          element.setAttribute("style", "fill:black");
        }

        break;
      case "svg":
        element.setAttribute("class", "h-10 w-10 text-green-600");
        if (toggleString == "server1") {
          element.setAttribute("viewBox", "0 0 382 382");
          element.setAttribute("style", "enable-background:new 0 0 382 382");
        } else {
          element.setAttribute("viewBox", "0 0 438.549 438.549");
          element.setAttribute(
            "style",
            "enable-background:new 0 0 438.549 438.549"
          );
        }
        break;
      case "div":
        if (element.getAttribute("class").includes("mt-5 sm:mt-6")) {
          if (this.previsitedDate) {
            element.append("You previously visited at " + this.previsitedDate);
            element.setAttribute("class", "text-sm text-gray-500 mt-5 sm:mt-6");
            element.setAttribute("style", "text-align:center");
          }
        } else {
          element.setAttribute("style", "background-color:unset");
        }
        break;
      case "span":
        if (this.previsitedDate) {
          element.setAttribute("style", "margin-bottom:25px;");
        }
        break;
      default:
      // code block
    }
  }
}

// Used from Flaticon - designed by freepik
var linkedinlogo = `M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889
C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056
H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806
c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1
s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73
c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079
c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426
c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472
L341.91,330.654L341.91,330.654z`;

// Used from Flaticon - designed by Dave Gandy
var githublogo = `M409.132,114.573c-19.608-33.596-46.205-60.194-79.798-79.8C295.736,15.166,259.057,5.365,219.271,5.365
		c-39.781,0-76.472,9.804-110.063,29.408c-33.596,19.605-60.192,46.204-79.8,79.8C9.803,148.168,0,184.854,0,224.63
		c0,47.78,13.94,90.745,41.827,128.906c27.884,38.164,63.906,64.572,108.063,79.227c5.14,0.954,8.945,0.283,11.419-1.996
		c2.475-2.282,3.711-5.14,3.711-8.562c0-0.571-0.049-5.708-0.144-15.417c-0.098-9.709-0.144-18.179-0.144-25.406l-6.567,1.136
		c-4.187,0.767-9.469,1.092-15.846,1c-6.374-0.089-12.991-0.757-19.842-1.999c-6.854-1.231-13.229-4.086-19.13-8.559
		c-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559
		c-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-0.951-2.568-2.098-3.711-3.429c-1.142-1.331-1.997-2.663-2.568-3.997
		c-0.572-1.335-0.098-2.43,1.427-3.289c1.525-0.859,4.281-1.276,8.28-1.276l5.708,0.853c3.807,0.763,8.516,3.042,14.133,6.851
		c5.614,3.806,10.229,8.754,13.846,14.842c4.38,7.806,9.657,13.754,15.846,17.847c6.184,4.093,12.419,6.136,18.699,6.136
		c6.28,0,11.704-0.476,16.274-1.423c4.565-0.952,8.848-2.383,12.847-4.285c1.713-12.758,6.377-22.559,13.988-29.41
		c-10.848-1.14-20.601-2.857-29.264-5.14c-8.658-2.286-17.605-5.996-26.835-11.14c-9.235-5.137-16.896-11.516-22.985-19.126
		c-6.09-7.614-11.088-17.61-14.987-29.979c-3.901-12.374-5.852-26.648-5.852-42.826c0-23.035,7.52-42.637,22.557-58.817
		c-7.044-17.318-6.379-36.732,1.997-58.24c5.52-1.715,13.706-0.428,24.554,3.853c10.85,4.283,18.794,7.952,23.84,10.994
		c5.046,3.041,9.089,5.618,12.135,7.708c17.705-4.947,35.976-7.421,54.818-7.421s37.117,2.474,54.823,7.421l10.849-6.849
		c7.419-4.57,16.18-8.758,26.262-12.565c10.088-3.805,17.802-4.853,23.134-3.138c8.562,21.509,9.325,40.922,2.279,58.24
		c15.036,16.18,22.559,35.787,22.559,58.817c0,16.178-1.958,30.497-5.853,42.966c-3.9,12.471-8.941,22.457-15.125,29.979
		c-6.191,7.521-13.901,13.85-23.131,18.986c-9.232,5.14-18.182,8.85-26.84,11.136c-8.662,2.286-18.415,4.004-29.263,5.146
		c9.894,8.562,14.842,22.077,14.842,40.539v60.237c0,3.422,1.19,6.279,3.572,8.562c2.379,2.279,6.136,2.95,11.276,1.995
		c44.163-14.653,80.185-41.062,108.068-79.226c27.88-38.161,41.825-81.126,41.825-128.906
		C438.536,184.851,428.728,148.168,409.132,114.573z`;
