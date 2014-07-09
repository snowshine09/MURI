$.widget("vis.vismap", $.vis.viscontainer, {
	_create: function() {
		var self = this;
		self.Name = self.element.attr("id");
		self.SID = self.Name.split("_")[2];
		if (map[self.SID]) {
			return;
		}
		self.map = new OpenLayers.Map(self.Name);
		self.map.container = self;
		var cmb = "map_selectbar_" + self.SID;
		$("#" + cmb).attr("selectedIndex", 0).change(function() {
			var x = $("#" + cmb + " option:selected").val();
			generateOthers(self.Name, x);
			$("#" + cmb + " option:selected").removeAttr('selected');
			$("#" + cmb).attr("selectedIndex", 0);
		});

		self.loadLayers();
		self.loadFeatures();
		self.loadControls();

		$.contextMenu({
			selector: '#map_cvs_' + self.SID,
			items: {
				draw_polygon: {
					name: 'Draw polygon',
					callback: function() {
						self.setMode('draw_polygon');
					}
				},
				draw_line: {
					name: 'Draw line',
					callback: function() {
						self.setMode('draw_line');
					}
				}
			}
		});
	},
	loadLayers: function() {
		var self = this;
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

		self.pointlayer = new OpenLayers.Layer.Vector("Points", {
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
		self.linelayer = new OpenLayers.Layer.Vector("Lines", {
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style({
					strokeWidth: 2,
					strokeColor: '#FF0000',
					fillColor: '#FFDB73',
					fillOpacity: 0.4

				}),
				'select': new OpenLayers.Style({
					strokeWidth: 5,
					strokeColor: 'rgb(106, 86, 168)'
				})
			})
		});
		self.newFeatureLayer = new OpenLayers.Layer.Vector('New feature', {
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style({
					strokeColor: "#EE4F44",
					strokeOpacity: 1,
					strokeWidth: 2,
					fillColor: "#EE4F44",
					fillOpacity: 0
				}),
			})
		});
		self.map.addLayers([self.pointlayer, self.linelayer, self.newFeatureLayer]);

		self.map.setCenter(new OpenLayers.LonLat(44.42200, 33.32500).transform(
			new OpenLayers.Projection("EPSG:4326"),
			self.map.getProjectionObject()
		), 12);
	},
	loadFeatures: function() {
		var self = this;
		var points = [],
			lines = [];
		self.linelayer.removeAllFeatures();
		self.pointlayer.removeAllFeatures();
		var wktParser = new OpenLayers.Format.WKT();
		for (var i = 0; i < dataset[self.SID]['location'].length; i++) {
			var location = dataset[self.SID]['location'][i];
			if (location['shape'] !== undefined) {
				var feature = wktParser.read(location['shape']);
				var origin_prj = new OpenLayers.Projection("EPSG:" + location['srid']);
				var dest_prj = new OpenLayers.Projection("EPSG:900913");
				feature.geometry.transform(origin_prj, dest_prj); // projection of google map
				feature.attributes.id = location['uid'];
				feature.attributes.name = location['name'];
				location['shape'] = feature;
				if (feature instanceof OpenLayers.Geometry.Point) {
					points.push(location['shape']);
				} else {
					lines.push(location['shape']);
				}
			}
		}
		self.linelayer.addFeatures(lines);
		self.pointlayer.addFeatures(points);
	},
	loadControls: function() {
		var self = this;
		var controlPanel = new OpenLayers.Control.Panel();
		self.map.addControl(new OpenLayers.Control.LayerSwitcher());
		self.mapControls = {
			boxSelect: new OpenLayers.Control.SelectFeature([self.linelayer, self.pointlayer], {
				clickout: true,
				toggle: true,
				multiple: false,
				hover: false,
				box: true,
				onSelect: self.filterByLocation,
				onUnselect: self.filterByLocation,
				displayClass: 'olBoxSelect'
			}),
			select: new OpenLayers.Control.SelectFeature([self.linelayer, self.pointlayer], {
				clickout: true,
				toggle: true,
				multiple: false,
				hover: false,
				onSelect: self.filterByLocation,
				onUnselect: self.filterByLocation,
				displayClass: 'olPan'
			}),
			navigate: new OpenLayers.Control.Navigation(),
			draw_polygon: new OpenLayers.Control.DrawFeature(self.newFeatureLayer, OpenLayers.Handler.Polygon, {
				featureAdded: function(feature) {
					feature.state = OpenLayers.State.INSERT;
					self.onFeatureAdded(feature);
				}
			}),
			draw_line: new OpenLayers.Control.DrawFeature(self.newFeatureLayer, OpenLayers.Handler.Path, {
				featureAdded: function(feature) {
					feature.state = OpenLayers.State.INSERT;
					self.onFeatureAdded(feature);
				}
			})
		};
		for (var key in self.mapControls) {
			self.map.addControl(self.mapControls[key]);
			controlPanel.addControls([self.mapControls[key]]);
		}
		self.map.addControl(controlPanel);
		self.setMode('navigation');
	},

	update: function() {
		var self = this;
		// unhighlight all
		if (self.mapControls['select'].layers != null) {
			self.mapControls['select'].layers.forEach(function(layer) {
				for (var i = 0, len = layer.features.length; i < len; i++) {
					self.mapControls['select'].unhighlight(layer.features[i]);
				}
			});
		} else {
			alert('layers are empty!');
		}
		var count = 0,
			tmpFeature;
		for (var i = 0; i < self.linelayer.features.length; i++) {
			if ($.inArray(self.linelayer.features[i].attributes.id, dindex[self.SID]) != -1) {
				self.mapControls['select'].highlight(self.linelayer.features[i]);
				count++;
				tmpFeature = self.linelayer.features[i];
			}
		}
		for (var i = 0; i < self.pointlayer.features.length; i++) {
			if ($.inArray(self.pointlayer.features[i].attributes.id, dindex[self.SID]) != -1) {
				self.mapControls['select'].highlight(self.pointlayer.features[i]);
				count++;
				tmpFeature = self.pointlayer.features[i];
			}
		}
		self.linelayer.redraw();
		self.pointlayer.redraw();
		if (count == 1) {
			var lon = tmpFeature.geometry.getCentroid().x;
			var lat = tmpFeature.geometry.getCentroid().y;
			self.map.panTo(new OpenLayers.LonLat(lon, lat));
		}
	},

	onFeatureAdded: function(feature) {
		var self = this;
		self.setMode('navigation');
		$('#new-footprint-form-' + self.SID).dialog({
			title: 'New footprint',
			width: 'auto',
			height: 'auto',
		});
		if (!$('#event_dlg_' + self.SID).length) {
			createDialog('event', self.SID, null);
		}
		$('#new-footprint-form-' + self.SID).removeClass("hidden").dialog("open");
		$('#new-footprint-save-' + self.SID).click(function(e) {
			e.preventDefault();
            var related_entities = $('#related-events-' + self.SID).text();
            if (related_entities === '(none)' || related_entities.length == 0) {
                alert('Please select at least one event.');
                return;
            }
			var footprint = {};
			footprint.name = $("#new-footprint-name-" + self.SID).val();
			footprint.srid = 4326;
            footprint.entities = related_entities.split(' ');
			footprint.shape = new OpenLayers.Format.WKT().write(feature);
			footprint.created_at = new Date();
			$.ajax({
				url: 'footprint/',
				type: "post",
                data: footprint,
				success: function(xhr) {
					$("#new-footprint-name-" + self.SID).val('');
					$('#new-plan-content').val('');
					$('#new-footprint-form-' + self.SID).addClass("hidden").dialog("close");
                    self.newFeatureLayer.removeAllFeatures();
                    self.linelayer.addFeatures([feature]);
                    feature.attributes.id = xhr.id;
                    feature.attributes.name = footprint.name;
                    dataset[self.SID]['location'].push({
                        frequency: 1,
                        name: footprint.name,
                        node: 'footprint',
                        shape: feature,
                        srid: 900913,
                        uid: xhr.id
                    });
				},
				error: function(xhr) {
					alert("failed to add footprint!")
				},
			});
		});
		$('#new-footprint-discard-' + self.SID).click(function(e) {
			e.preventDefault();
			$('#new-footprint-form-' + self.SID).addClass("hidden").dialog("close");
		});
	},
	setMode: function(mode) {
		var self = this;
		switch (mode) {
			case 'navigation':
				self.mapControls['navigate'].activate();
				self.mapControls['select'].activate();
				self.mapControls['boxSelect'].deactivate();
				self.mapControls['draw_polygon'].deactivate();
				self.mapControls['draw_line'].deactivate();
				break;
			case 'draw_polygon':
				self.mapControls['navigate'].deactivate();
				self.mapControls['select'].deactivate();
				self.mapControls['boxSelect'].deactivate();
				self.mapControls['draw_polygon'].activate();
				self.mapControls['draw_line'].deactivate();
				break;
			case 'draw_line':
				self.mapControls['navigate'].deactivate();
				self.mapControls['select'].deactivate();
				self.mapControls['boxSelect'].deactivate();
				self.mapControls['draw_polygon'].deactivate();
				self.mapControls['draw_line'].activate();
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
		var self = this.map.container;
		var selectedFeas = []; // selected feature ids
		// get the id of all selected features
		if (this.layers != null) {
			this.layers.forEach(function(layer) {
				for (var i = 0, len = layer.selectedFeatures.length; i < len; i++) {
					selectedFeas.push(layer.selectedFeatures[i].attributes.id);
				}
			});
		} else {
			for (var i = 0, len = this.layer.selectedFeatures.length; i < len; i++) {
				selectedFeas.push(this.layer.selectedFeatures[i].attributes.id);
			}
		}
		propagate('map', self.SID, selectedFeas);
	},
});