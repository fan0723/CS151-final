var map;
var service;
var restaurants = [];
var selectedRestaurant;
var myLatLng;

function initMap() {

    var locationElement = document.getElementById("current-location");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            myLatLng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log(myLatLng);
            locationElement.textContent = "現在位置: 緯度 " + myLatLng.lat.toFixed(6) + "°, 經度 " + myLatLng.lng.toFixed(6) + "°";
        }, function (error) {
            console.error("無法定位到現在位置:", error, "使用預設位置");
            myLatLng = { lat: 24.9686517, lng: 121.2614491 };
            locationElement.textContent = "無法定位到現在位置，使用預設位置: 緯度 " + myLatLng.lat.toFixed(6) + "°, 經度 " + myLatLng.lng.toFixed(6) + "°";
        });
    } else {
        console.error("瀏覽器不支援定位功能, 使用預設位置");
        myLatLng = { lat: 24.9686517, lng: 121.2614491 };
        locationElement.textContent = "無法定位到現在位置，使用預設位置: 緯度 " + myLatLng.lat.toFixed(6) + "°, 經度 " + myLatLng.lng.toFixed(6) + "°";
    }

    map = new google.maps.Map(document.getElementById("map"), {
        center: myLatLng,
        zoom: 14
    });
    service = new google.maps.places.PlacesService(map);
}

function startSearch() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(function (checkbox) {
        checkbox.disabled = true;
    });

    map = new google.maps.Map(document.getElementById("map"), {
        center: myLatLng,
        zoom: 14
    });
    service = new google.maps.places.PlacesService(map);

    var selectedOptions = [];
    var checkboxes = document.querySelectorAll('input[name="option"]:checked');
    checkboxes.forEach(function (checkbox) {
        console.log(checkbox.value)
        selectedOptions.push(checkbox.value);
    });
    var customCheckbox = document.getElementById("custom-checkbox");
    var customInput = document.getElementById("custom-option");
    var customValue = customInput.value.trim();
    if (customCheckbox.checked && customValue !== "") {
        console.log(customValue);
        selectedOptions.push(customValue);
    }

    // 遍歷每一個selectedOptions
    for (var i = 0; i < selectedOptions.length; i++) {
        if (selectedOptions[i] === "on") {
            continue;
        }
        var request = {
            location: myLatLng,
            radius: 800,
            type: "restaurant",
            keyword: selectedOptions[i],
            fields: ["place_id"]
        };
        service.nearbySearch(request, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].types.includes("restaurant")) {
                        var restaurant = results[i];
                        createMarker(restaurant);
                        restaurants.push(restaurant);
                        addRestaurantToList(restaurant, i);
                    }
                }
            }
        });
    }
    // var request = {
    //     location: myLatLng,
    //     radius: 800,
    //     type: "restaurant",
    //     keyword: "麵",
    //     fields: ["place_id"]
    // };

    // service.nearbySearch(request, function (results, status) {
    //     if (status === google.maps.places.PlacesServiceStatus.OK) {
    //         for (var i = 0; i < results.length; i++) {
    //             var restaurant = results[i];
    //             createMarker(restaurant);
    //             restaurants.push(restaurant);
    //             addRestaurantToList(restaurant, i);
    //         }
    //     }
    // });
    var randomBtn = document.getElementById("random-btn-aftersearch");
    randomBtn.style.display = "inline-block";
    randomBtn.addEventListener("click", selectRandomRestaurant);

    document.getElementById("start-btn").style.display = "none";
    document.getElementById("random-btn-beforesearch").style.display = "none"
    document.getElementById("reset-btn").style.display = "inline-block";
}

function startSearch_random() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(function (checkbox) {
        checkbox.disabled = true;
    });

    map = new google.maps.Map(document.getElementById("map"), {
        center: myLatLng,
        zoom: 14
    });
    service = new google.maps.places.PlacesService(map);

    var selectedOptions = [];
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        selectedOptions.push(checkbox.value);
    });
    var customCheckbox = document.getElementById("custom-checkbox");
    var customInput = document.getElementById("custom-option");
    var customValue = customInput.value.trim();
    if (customCheckbox.checked && customValue !== "") {
        selectedOptions.push(customValue);
    }
    // 將selectedOptions中的"on"移除
    selectedOptions = selectedOptions.filter(function (option) {
        return option !== "on";
    });
    // 隨機選擇selectedOptions的其中一個
    var randomIndex = Math.floor(Math.random() * selectedOptions.length);
    var randomOption = selectedOptions[randomIndex];
    console.log(randomOption);
    var request = {
        location: myLatLng,
        radius: 800,
        type: "restaurant",
        keyword: randomOption,
        fields: ["place_id"]
    };

    service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // 隨機選取一個餐廳
            while (1) {
                var randomIndex = Math.floor(Math.random() * results.length);
                var restaurant = results[randomIndex];
                createMarker(restaurant);
                restaurants.push(restaurant);
                addRestaurantToList(restaurant, randomIndex);
                selectRandomRestaurant();
                if (restaurant.types.includes("restaurant")) { break; }
            }
        }
    });

    document.getElementById("start-btn").style.display = "none";
    document.getElementById("random-btn-beforesearch").style.display = "none";
    document.getElementById("reset-btn").style.display = "inline-block";
}

function createMarker(place) {
    var marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map
    });

    var infowindow = new google.maps.InfoWindow({
        content: place.name
    });

    marker.addListener("click", function () {
        infowindow.open(map, marker);
    });

    place.marker = marker;
}

function selectRandomRestaurant() {
    var randomIndex = Math.floor(Math.random() * restaurants.length);
    selectedRestaurant = restaurants[randomIndex];
    highlightRestaurant(randomIndex);
    displayRestaurantDetails(selectedRestaurant);
    for (var i = 0; i < restaurants.length; i++) {
        var restaurant = restaurants[i];
        if (restaurant === selectedRestaurant) {
            restaurant.marker.setMap(map);
        } else {
            restaurant.marker.setMap(null);
        }
    }
}

function highlightRestaurant(index) {
    var restaurantListItems = document.getElementsByClassName("restaurant-item");
    for (var i = 0; i < restaurantListItems.length; i++) {
        restaurantListItems[i].classList.remove("highlight");
    }
    restaurantListItems[index].classList.add("highlight");
}

function addRestaurantToList(restaurant, index) {
    var restaurantList = document.getElementById("restaurant-list");
    var li = document.createElement("li");
    var link = document.createElement("a");
    link.href = "https://www.google.com/search?q=" + encodeURIComponent(restaurant.name);
    link.innerHTML = restaurant.name + " - " + restaurant.vicinity + " - " + restaurant.rating;
    li.classList.add("restaurant-item");
    li.addEventListener("click", function () {
        highlightRestaurant(index);
        selectedRestaurant = restaurant;
        selectRandomRestaurant();
    });
    li.appendChild(link);
    restaurantList.appendChild(li);
}

function displayRestaurantDetails(restaurant) {
    // 获取详细信息容器
    var detailsContainer = document.getElementById("restaurant-details");

    // 清空容器内容
    detailsContainer.innerHTML = "";

    // 创建标题元素
    var titleElement = document.createElement("h2");
    titleElement.textContent = restaurant.name;

    // 创建地址元素
    var addressElement = document.createElement("p");
    addressElement.textContent = "地址: " + restaurant.vicinity;

    // 使用 Place Details 请求获取更多详细信息
    var request = {
        placeId: restaurant.place_id,
        fields: ["formatted_phone_number", "rating", "photos"]
    };

    service.getDetails(request, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // 创建电话元素
            if (place.formatted_phone_number) {
                var phoneElement = document.createElement("p");
                phoneElement.textContent = "電話: " + place.formatted_phone_number;
                detailsContainer.appendChild(phoneElement);
            }

            // 创建评级元素
            if (place.rating) {
                var ratingElement = document.createElement("p");
                ratingElement.textContent = "評級: " + place.rating;
                detailsContainer.appendChild(ratingElement);
            }

            // 创建照片元素
            if (place.photos && place.photos.length > 0) {
                var photosContainer = document.createElement("div");
                photosContainer.classList.add("photos-container");

                for (var i = 0; i < place.photos.length; i++) {
                    var photo = place.photos[i];
                    var photoElement = document.createElement("img");
                    photoElement.src = photo.getUrl({ maxWidth: 200 });
                    photosContainer.appendChild(photoElement);
                }

                detailsContainer.appendChild(photosContainer);
            }
        }
    });

    // 将元素添加到容器
    detailsContainer.appendChild(titleElement);
    detailsContainer.appendChild(addressElement);
}

function resetSelection() {
    // 清空已选中的复选框
    Array.from(document.querySelectorAll('input[name="option"]:checked')).forEach(function (checkbox) {
        checkbox.checked = false;
    });

    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        checkbox.disabled = false;
    });

    // 清空餐厅列表
    document.getElementById("restaurant-list").innerHTML = "";

    // 清空餐厅详细信息
    var detailsContainer = document.getElementById("restaurant-details");
    detailsContainer.innerHTML = "";

    restaurants = [];
    selectedOptions = [];
    var customInput = document.getElementById("custom-option");
    customInput.value = "";
    customInput.style.display = "none";

    // 隐藏重置按钮并显示开始按钮
    document.getElementById("reset-btn").style.display = "none";
    document.getElementById("start-btn").style.display = "inline-block";
    document.getElementById("random-btn-beforesearch").style.display = "inline-block";
    document.getElementById("random-btn-aftersearch").style.display = "none"
}

function getCurrentLocation() {
    var locationElement = document.getElementById("current-location");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            myLatLng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log(myLatLng);
            locationElement.textContent = "現在位置: 緯度 " + myLatLng.lat.toFixed(6) + "°, 經度 " + myLatLng.lng.toFixed(6) + "°";
        }, function (error) {
            console.error("無法定位到現在位置:", error, "使用預設位置");
            myLatLng = { lat: 24.9686517, lng: 121.2614491 };
            locationElement.textContent = "無法定位到現在位置，使用預設位置: 緯度 " + myLatLng.lat.toFixed(6) + "°, 經度 " + myLatLng.lng.toFixed(6) + "°";
        });
    } else {
        console.error("瀏覽器不支援定位功能, 使用預設位置");
        myLatLng = { lat: 24.9686517, lng: 121.2614491 };
        locationElement.textContent = "無法定位到現在位置，使用預設位置: 緯度 " + myLatLng.lat.toFixed(6) + "°, 經度 " + myLatLng.lng.toFixed(6) + "°";
    }
}

document.getElementById("start-btn").addEventListener("click", function () {
    // 如果沒有在checkbox選擇任何選項，則彈出警告並不執行startSearch，直到使用者選取
    if (!document.querySelector('input[name="option"]:checked')) {
        alert("請選擇至少一個選項");
        return;
    }
    startSearch();

});

document.getElementById("reset-btn").addEventListener("click", function () {
    resetSelection();
    initMap();
});

document.getElementById("random-btn-beforesearch").addEventListener("click", function () {
    startSearch_random();
});

initMap();


function toggleCustomInput() {
    var customCheckbox = document.getElementById("custom-checkbox");
    var customInput = document.getElementById("custom-option");

    if (customCheckbox.checked) {
        customInput.style.display = "inline-block";
    } else {
        customInput.style.display = "none";
    }
}

