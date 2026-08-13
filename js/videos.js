fetch("data/links.json")
.then(response => response.json())
.then(data => {

    console.log(data);

    const container = document.getElementById("allVideos");

    data.VIDEOS.forEach(video => {

        container.innerHTML += `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">

            <img src="${video.thumbnail}"
                 class="w-full h-56 object-cover">

            <div class="p-5">

                <h2 class="text-2xl font-bold">
                    ${video.title}
                </h2>

                <p class="mt-2 text-gray-600">
                    ${video.description}
                </p>

                <a href="${video.url}"
                   target="_blank"
                   class="inline-block mt-5 bg-red-600 text-white px-5 py-3 rounded-lg">

                    ${video.platform === "instagram"
? "📷 View Reel"
: "▶ Watch Video"}

                </a>

            </div>

        </div>
        `;

    });

})
.catch(error => {

    console.log(error);

});