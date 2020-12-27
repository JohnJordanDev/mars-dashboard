const store = {
  user: { name: "John" },
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  activeRover: "",
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

const buildNavList = (roverList) => {
  let list = "";
  list = roverList.map((rover) => `<button>${rover}</button>`);
  return list.join("");
};

const App = (state) => {
  const { rovers } = state;
  return `
  <section class="dashboard_gallery">
                <button><</button>
                <div><img height="300" width="300" src="" alt=""></div>
                <button>></button>
            </section>
            <section class="dashboard_content">
                <nav class="dashboard_roverList">
                    ${buildNavList(rovers)}
                </nav>
                <section class="dashboard_roverDetails">
                    <header>
                        <h2>Rover</h2>
                    </header>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                        Ipsum sunt blanditiis odit beatae pariatur, harum eius ex ad reiciendis, 
                        mollitia quisquam iusto temporibus labore? Impedit 
                        quidem asperiores architecto qui perferendis.
                    </p>
                </section>
            </section>`;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
  if (name) {
    return `
            <h1>Welcome, ${name}!</h1>
        `;
  }

  return `
        <h1>Hello!</h1>
    `;
};

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
const getSpiritData = (state) => {
  let { spirit } = state;
  let data;
  console.log("spirit is ", spirit);
  console.log("store is ", store);

  fetch("http://localhost:3000/spirit")
    .then((res) => res.json())
    .then((spiritData) => {
      data = spiritData.spirit.rover;
      console.log("spiritData is ", spiritData);
      spirit = {
        launchDate: data.launch_date,
        landingDate: data.landing_date,
        status: data.status,
        dateMostRecentPhotos: data.max_date,
        photos: spiritData.spiritPhotos.photos,
      };
      updateStore(store, { spirit });
      render(root, store);
      console.log("result is: ", store);
    });

  // return data;
};

getSpiritData(store);
