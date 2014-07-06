$.widget("vis.vismap", $.vis.viscontainer, {
	_create: function() {
		var self = this;
		self.Name = self.element.attr("id");
		self.SID = self.Name.split("_")[2];
		self.map = new OpenLayers.Map(self.Name);
		self.map.addControl(new OpenLayers.Control.LayerSwitcher());
		self.map.addControl(new OpenLayers.Control.Navigation({
			zoomWheelEnabled: true,
		}));
		var gphy = new OpenLayers.Layer.Google(
			"Google Physical", {
				type: google.maps.MapTypeId.TERRAIN
			}
		);
		var gmap = new OpenLayers.Layer.Google(
			"Google Streets", {
				numZoomLevels: 22
			}
		);
		var ghyb = new OpenLayers.Layer.Google(
			"Google Hybrid", {
				type: google.maps.MapTypeId.HYBRID,
				numZoomLevels: 22
			}
		);
		var gsat = new OpenLayers.Layer.Google(
			"Google Satellite", {
				type: google.maps.MapTypeId.SATELLITE,
				numZoomLevels: 22
			}
		);
		self.map.addLayers([gphy, gmap, ghyb, gsat]);

		var pointlayer = new OpenLayers.Layer.Vector("Points", {
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style({
					externalGraphic: 'static/dashboard/img/red_pin.png',
					pointRadius: 16
				}),
				'select': new OpenLayers.Style({
					externalGraphic: 'static/dashboard/img/blue_pin.png',
					pointRadius: 16
				})
			})
		});
		var linelayer = new OpenLayers.Layer.Vector("Lines", {
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style({
					strokeWidth: 3,
					strokeColor: '#FF0000',
					fillColor: '#FFDB73',
					fillOpacity: 0.4

				}),
				'select': new OpenLayers.Style({
					strokeWidth: 3,
					strokeColor: '#0000FF'
				})
			})
		});
		self.map.addLayers([pointlayer, linelayer]);

		self.map.setCenter(new OpenLayers.LonLat(44.42200, 33.32500).transform(
			new OpenLayers.Projection("EPSG:4326"),
			self.map.getProjectionObject()
		), 12);

		var controlPanel = new OpenLayers.Control.Panel();
		var mapControls = {
			select: new OpenLayers.Control.SelectFeature(
				[linelayer, pointlayer], {
					clickout: true,
					toggle: true,
					multiple: false,
					hover: false,
					toggleKey: "ctrlKey", // ctrl key removes from selection
					multipleKey: "shiftKey", // shift key adds to selection
					onSelect: self.filterByLocation,
					onUnselect: self.filterByLocation,
					box: true
				}
			),
			navigate: new OpenLayers.Control.Navigation()
		};
		for (var key in mapControls) {
			self.map.addControl(mapControls[key]);
			controlPanel.addControls([mapControls[key]]);
		}
		self.map.addControl(controlPanel);

		self.linelayer = linelayer;
		self.pointlayer = pointlayer;
		self.mapControls = mapControls;

		var cmb = "map_selectbar_" + self.SID;

		$("#" + cmb).attr("selectedIndex", 0).change(function() {
			var x = $("#" + cmb + " option:selected").val();
			generateOthers(self.Name, x);
			$("#" + cmb + " option:selected").removeAttr('selected');
			$("#" + cmb).attr("selectedIndex", 0);
		});
	},
	update: function(uType) {
		var self = this;
		var linelayer = self.linelayer;
		var pointlayer = self.pointlayer;
		var selectLineFeatureControl = new OpenLayers.Control.SelectFeature(linelayer);
		self.map.addControl(selectLineFeatureControl);
		selectLineFeatureControl.activate();
		selectLineFeatureControl.unselectAll();
		var selectPointFeatureControl = new OpenLayers.Control.SelectFeature(pointlayer);
		self.map.addControl(selectPointFeatureControl);
		selectPointFeatureControl.activate();
		selectPointFeatureControl.unselectAll();
		var points = [],
			lines = [];
		switch (uType) {
			case "init":
				linelayer.removeAllFeatures();
				pointlayer.removeAllFeatures();
				dataset[self.SID]['dFootprint'].group().top(Infinity).forEach(function(d, i) {
					var fp = d.key;
					if (fp[0] != undefined && d.value != 0) {
						if (fp[2] != undefined) { // has shape attr
							if (fp[2].geometry instanceof OpenLayers.Geometry.Point) {
								points.push(fp[2]);
							} else {
								lines.push(fp[2]);
							}
						}
					}
				});
				linelayer.addFeatures(lines);
				pointlayer.addFeatures(points);
				for (var i = 0; i < linelayer.features.length; i++) {
					if ($.inArray(linelayer.features[i].attributes.id, hshape[self.SID]) != -1) {
						selectLineFeatureControl.select(linelayer.features[i]);
					}
				}

				for (var i = 0; i < pointlayer.features.length; i++) {
					if ($.inArray(pointlayer.features[i].attributes.id, hshape[self.SID]) != -1) {
						selectPointFeatureControl.select(pointlayer.features[i]);
					}
				}
				linelayer.redraw();
				pointlayer.redraw();

				break;
			case "brush":
				for (var i = 0; i < linelayer.features.length; i++) {
					if ($.inArray(linelayer.features[i].attributes.id, hshape[self.SID]) != -1) {
						selectLineFeatureControl.select(linelayer.features[i]);
					}
				}

				for (var i = 0; i < pointlayer.features.length; i++) {
					if ($.inArray(pointlayer.features[i].attributes.id, hshape[self.SID]) != -1) {
						selectPointFeatureControl.select(pointlayer.features[i]);
					}
				}
				linelayer.redraw();
				pointlayer.redraw();
				break;
		}
	},
	highlight: function(features_id) {
        var self = this;
		for (var i = 0; i < self.highlightedFeatures.length; i++) {
			self.mapControls['select'].unhighlight(self.highlightedFeatures[i]);
		}
		self.highlightedFeatures = [];
		for (var i = 0; i < self.map.popups.length; i++) {
			self.map.removePopup(self.map.popups[i]);
		}

		var layers = [linelayer, pointlayer];
		for (var i = 0; i < features_id.length; i++) {
			for (var j = 0; j < layers.length; j++) {
				var found = false;
				var locallayer = layers[j];
				for (var k = 0, len = locallayer.features.length; k < len; k++) {
					if (locallayer.features[k].attributes.id == features_id[i]) {
						self._showDetails(locallayer.features[k]);
						self.mapControls['select'].highlight(locallayer.features[k]);
						self.highlightedFeatures.push(locallayer.features[k]);
						found = true;
						break;
					}
				}
				if (found == true) break;
			}
		}
	},

	_showDetails: function(feature) {
		$("#footprint_popup #footprint_name").text(feature.attributes.name);
		$("#footprint_popup #footprint_id").text(feature.attributes.id);
		var content = $('#footprint_popup').css('display', '').clone();

		feature.popup = new OpenLayers.Popup.FramedCloud(
			"footprint_info",
			feature.geometry.getBounds().getCenterLonLat(),
			new OpenLayers.Size(200, 150),
			content.html(),
			null,
			true
		);

		this.map.addPopup(feature.popup, true);
	},

	filterByLocation: function(feature) {
		var self = $(this.div).parents('.ui-dialog-content').vismap().data("vismap");
		var selectedFeas = []; // selected feature ids
		hshape[self.SID] = [];
		// get the id of all selected features
		this.layers.forEach(function(layer) {
			for (var i = 0, len = layer.selectedFeatures.length; i < len; i++) {
				selectedFeas.push(layer.selectedFeatures[i].attributes.id);
			}
		});

		if (selectedFeas.length == 0) {
			// dataset[self.SID]['dFootprint'].filterAll();

		} else {
			// filter event data by above feature ids
			var count = 0;
			dataset[self.SID]['dFootprint'].filter(function(fp) { // fp is an array [id, name, shape, srid]
				if (fp[0] != undefined) {

					for (var j = 0; j < selectedFeas.length; j++) {
						if (fp[0] === selectedFeas[j]) {
							if ($.inArray(fp[0], hshape[self.SID]) == -1) hshape[self.SID].push(fp[0]);
							// count++;
							// return true;
						}
					}
				}
				return false;
			});
			console.log(count);
		}
		renderAllExcept(self.Name, "brush");
	},

	updateSize: function() {
		this.map.updateSize();
	},

	destroy: function() {
		this.map.destroy();
		this._super("_destroy");
	},
});
