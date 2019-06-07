/*
 * Bing map for djangocms_maps, https://github.com/Organice/djangocms-maps
 *
 * Copyright (c) 2016 Peter Bittner <django@bittner.it>
 * Copyright (c) 2016 Divio (original author for Google Maps implementation)
 *
 * documentation: https://msdn.microsoft.com/en-us/library/mt712552.aspx
 */

var djangocms = window.djangocms || {};

/**
 * Bing map instances from plugins.
 *
 * @class Maps
 * @namespace djangocms
 */
djangocms.Maps = {

    container: '.djangocms-maps-container',
    options: {},

    /**
     * Initializes all Map instances.
     *
     * @method init
     * @param {Object} opts overwrite default options
     */
    init: function () {
        // loop through every instance
        var _this = this;
        $(this.container).each(function (index, container) {
            _this.initializeMap($(container));
        });
    },

    /**
     * Loads a single Map instance provided by ``init``.
     *
     * @method initializeMap
     * @param {jQuery} instance jQuery element used for initialization
     */
    initializeMap: function ($container) {
        var _this = this,
            data = $container.data(),
            options = {
                credentials: data.api_key,
                navigationBarMode: Microsoft.Maps.NavigationBarMode.compact,
                showLocateMeButton: false,
                zoom: data.zoom,
                disableScrollWheelZoom: !data.scrollwheel,
                disableZooming: !data.double_click_zoom && !data.scrollwheel,
                disablePanning: !data.draggable,
                showZoomButtons: data.zoom_control,
                showMapTypeSelector: data.layers_control,
                showScalebar: data.scale_bar,
                styles: data.style
            },
            map = new Microsoft.Maps.Map($container[0], options);

        if (data.latlng) {
            var location = Microsoft.Maps.Location.parseLatLong(data.latlng);
            this.displayMap(map, location);
            this.addMarker(map, location, data);
        } else {
            // load latlng from given address
            Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
                var searchManager = new Microsoft.Maps.Search.SearchManager(map);
                var requestOptions = {
                    bounds: map.getBounds(),
                    where: data.address,
                    callback: function (answer, userData) {
                        // use user-set zoom level for displaying result
                        _this.displayMap(map, answer.results[0].location);
                        _this.addMarker(map, answer.results[0].location, data);
                    }
                };
                searchManager.geocode(requestOptions);
            });
        }
    },

    /**
     * Display a single Map instance provided by ``initinitlizeMap``.
     *
     * @method displayMap
     * @param {Microsoft.Maps.Map} map instance
     * @param {Microsoft.Maps.Location} location instance
     */
    displayMap: function (map, location) {
        var options = map.getOptions();
        options.center = location;
        map.setView(options);
    },

    /**
     * Adds a marker to a Map instance.
     *
     * @method addMarker
     * @param {Microsoft.Maps.Map} map instance
     * @param {Microsoft.Maps.Location} location instance
     * @param {Object} data the data objects from a Map instance
     */

    addMarker: function (map, location, data) {
        var pushpin = new Microsoft.Maps.Pushpin(location, null);

        if (data.show_infowindow) {
            // prepare info window
            var windowContent = data.address;
            if (data.info_content) {
                windowContent += '<br /><em>' + data.info_content + '</em>';
            }

            var infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
                title: data.title,
                description: windowContent
            });

            infobox.setMap(map);

            Microsoft.Maps.Events.addHandler(pushpin, 'click', function () {
                infobox.setOptions({visible: true});
            });
        }

        map.entities.push(pushpin);
    }

};

// callback function, initializes all occurring Maps plugins at once
function djangocms_Maps_init() {
    djangocms.Maps.init();
}
