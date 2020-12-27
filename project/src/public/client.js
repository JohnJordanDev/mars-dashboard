const store = {
  user: { name: "John" },
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  activeRover: "",
  allRoversData: []
};

// add our markup to the page
const root = document.getElementById("rover-root");

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
// const App = (state) => {
//   const { rovers, apod } = state;

//   return `
//         <header></header>
//         <main>
//             ${Greeting(store.user.name)}
//             <section>
//                 <h3>Put things on the page!</h3>
//                 <p>Here is an example section.</p>
//                 <p>
//                     One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
//                     the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
//                     This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
//                     applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
//                     explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
//                     but generally help with discoverability of relevant imagery.
//                 </p>
//                 ${ImageOfTheDay(apod)}
//             </section>
//         </main>
//         <footer></footer>
//     `;
// };
const isActive = (rover, state) => {
  if (rover === state.activeRover) {
    return "active";
  }
  return "";
};

const buildNavList = (roverList, state) => roverList
  .map(
    (rover) => `<button class="dashboard_roverList-button ${isActive(
      rover,
      state
    )}">${rover}</button>`
  )
  .join("");

const getListRoverFacts = (activeRover) => `
    <ul>
      <li>Launch Date: ${activeRover.launchDate}</li>
      <li>Landing Date: ${activeRover.landingDate}</li>
      <li>Status: ${activeRover.status}</li>
      <li>Date of most recent photos: ${activeRover.dateMostRecentPhotos}</li>   
    </ul>`;

const getActiveRoverData = (state) => state.allRoversData.filter(
  (rover) => rover.name === state.activeRover
)[0];

const App = (state) => {
  const { rovers, activeRover } = state;
  const activeRoverData = getActiveRoverData(state);
  if (typeof activeRoverData === "undefined") {
    return `<p>Loading...</p>`;
  }
  return `
  <section class="dashboard_gallery">
                <button><</button>
                <div>
                  <img height="300" width="300" src="${activeRoverData.photos[0].img_src}" alt="image from ${activeRover} rover"></div>
                <button>></button>
            </section>
            <section class="dashboard_content">
                <nav class="dashboard_roverList">
                    ${buildNavList(rovers, state)}
                </nav>
                <section class="dashboard_roverDetails">
                    <header>
                        <h2>${activeRover}</h2>
                        <p>
                          Rover facts: 
                          ${getListRoverFacts(activeRoverData)}
                        </p>
                    </header>
                </section>
            </section>`;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  console.log(photodate.getDate(), today.getDate());

  console.log(photodate.getDate() === today.getDate());
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === "video") {
    return `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `;
  }
  return `
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `;
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
  const { apod } = state;

  fetch("http://localhost:3000/apod")
    .then((res) => res.json())
    .then((apod) => updateStore(store, { apod }));

  // return data;
};

// Example API call
// Need to use ImmutableJS here
const getSpiritData = (roverName, state) => {
  let allRoversData = state.allRoversData;
  let data;
  const lowerRoverName = roverName.toLowerCase();
  let rover;
  console.log("roverData ", allRoversData);

  fetch("http://localhost:3000/spirit")
    .then((res) => res.json())
    .then((spiritData) => {
      data = spiritData.spirit.rover;
      rover = {
        name: roverName,
        launchDate: data.launch_date,
        landingDate: data.landing_date,
        status: data.status,
        dateMostRecentPhotos: data.max_date,
        photos: spiritData.spiritPhotos.photos
      };
      allRoversData.push(rover);
      updateStore(store, { allRoversData, activeRover: "Spirit" });
      render(root, store);
      // console.log("result is: ", store);
    });

  // return data;
};

getSpiritData("Spirit", store);
