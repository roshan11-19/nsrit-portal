fetch("data/gallery.json")

.then(res=>res.json())

.then(data=>{

const gallery=document.getElementById("gallery");

data.forEach(item=>{

gallery.innerHTML+=`

<div onclick="openPopup('${item.image}',
'${item.title}',
'${item.description}')"

class="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transition duration-300 hover:-translate-y-3 hover:shadow-2xl">

<img src="${item.image}"

class="h-64 w-full object-cover">

<div class="p-5">

<h2 class="text-2xl font-bold">

${item.title}

</h2>

<p class="text-gray-600 mt-2">

${item.description}

</p>

</div>

</div>

`;

});

});

function openPopup(image,title,description){

document.getElementById("popup").classList.remove("hidden");

document.getElementById("popupImage").src=image;

document.getElementById("popupTitle").innerHTML=title;

document.getElementById("popupDescription").innerHTML=description;

}

function closePopup(){

document.getElementById("popup").classList.add("hidden");

}