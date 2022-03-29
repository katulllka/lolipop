function init() {
    const suggestView1 = new ymaps.SuggestView('suggest');
    const map = new ymaps.Map("js-map", {
        center: [55.751410395513716,37.61888928175352],
        zoom: 18,
    });

    const placemark = new ymaps.Placemark([55.751410395513716,37.61888928175352],{
        iconContent: 'Это кремль',
        },{
        preset: "islands#redStretchyIcon"
        }

    )
    map.geoObjects.add(placemark);
    suggestView1.geoObjects.add(SuggestView);

}

ymaps.ready(init);
