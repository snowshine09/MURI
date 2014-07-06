SIIL.Network = function($div, link_no) {
	var self = this;
	self.SID = link_no;
	self.Type = 'network';
	self.Name = 'network_cvs_' + self.SID;
	self.width = $("#network_dlg_" + self.SID).innerWidth(); //outerWidth();
	self.height = $("#network_dlg_" + self.SID).innerHeight();
	self.mode = "pan";
	var cmb = $div.find('.selectbar').attr('id');
	$("#" + cmb).attr("selectedIndex", 0).change(function() {
		var x = $("#" + cmb + " option:selected").val();
		var selectedNodes = svg.selectAll(".selected");
		if (selectedNodes) {
			dindex[self.SID] = [];
			selectedNodes.each(function(d) {
				dindex[self.SID].push(d.uid);
			});
		}
		generateOthers(self.Name, x);
		$("#" + cmb + " option:selected").removeAttr('selected');
		$("#" + cmb).attr("selectedIndex", 0);
	});

	$("#network_mode_" + self.SID).click(function(e) {
		e.preventDefault();
		if ($('#network_mode_' + self.SID).text() == 'Pan mode') {
			self.mode = "brush";
			$('#network_mode_' + self.SID).text('Brush mode');
		} else {
			self.mode = "pan"
			$('#network_mode_' + self.SID).text('Pan mode');
		}
		update_mode();
	});

	self.force = d3.layout.force()
		.nodes([])
		.links([])
		.gravity(0.2)
		.charge(-400)
	// .linkDistance(120)
	.size([self.width, self.height])
		.on("tick", tick);

	self.shiftKey = null; //set shiftkey available all over the body
	d3.select("body")
		.attr("tabindex", 1)
		.on("keyup", keyflip)
		.on("keydown", keyflip)
		.each(function() {
			this.focus();
		});

	var x_scale = d3.scale.identity().domain([0, this.width]),
		y_scale = d3.scale.identity().domain([0, this.height]);

	//REGISTER behaviors: zoom, drag, brush
	self.zoom = d3.behavior.zoom()
		.scaleExtent([0, 15])
		.x(x_scale)
		.y(y_scale)
		.on("zoom", redraw);

	self.drag = self.force.drag()
		.on("dragstart", dragstarted)
		.on("drag", dragged)
		.on("dragend", dragended);

	self.brush = d3.svg.brush()
		.x(self.zoom.x())
		.y(self.zoom.y())
		.on("brushstart", function(d) {
			node.each(function(d) {
				d.previouslySelected = self.shiftKey && d.selected;
			});
		})
		.on("brush", function() {
			var extent = d3.event.target.extent();
			node.classed("selected", function(d) {
				return d.selected = d.previouslySelected ^
					(extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]);
			});
		})
		.on("brushend", function() {
			d3.event.target.clear();
			d3.select(this).call(d3.event.target);
			updateOthers();
		});

	var svg = d3.select('#' + self.Name)
		.attr("tabindex", 1)
		.on("keyup", keyflip)
		.on("keydown", keyflip)
		.each(function() {
			this.focus();
		})
		.append("svg:svg")
		.attr("width", self.width)
		.attr("height", self.height)
		.attr("pointer-events", "all")
		.style("overflow", "scroll")
		.append('svg:g')
		.attr("class", "zoom")
		.call(self.zoom)
		.append("svg:g");

	var rect = svg.append("rect")
		.attr("transform", "translate(-" + self.width / 2 + ",-" + self.height / 2 + ")")
		.attr("width", self.width * 2)
		.attr("height", self.height * 2)
		.style("fill", "none");

	var node = svg.selectAll(".node");
	var link = svg.selectAll(".link");

	update_mode();

	$("#network_gravity_" + self.SID).slider({
		value: 0.2,
		max: 1,
		step: 0.01,
		animate: true,
		slide: function(event, ui) {
			self.force.gravity(ui.value);
			$("#network_gravity_" + self.SID).siblings(".gravity_text").html(ui.value);
			if (force.alpha() == 0) force.start();
		}
	});
	$("#network_gravity_" + self.SID).siblings('.gravity_text').html($("#network_gravity_" + self.SID).slider("value"));

	function keyflip() {
		self.shiftKey = d3.event.shiftKey || d3.event.metaKey;
	}

	function redraw() {
		svg.attr("transform",
			"translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
	}

	function tick() {
		link.attr("x1", function(d) {
			return d.source.x;
		})
			.attr("y1", function(d) {
				return d.source.y;
			})
			.attr("x2", function(d) {
				return d.target.x;
			})
			.attr("y2", function(d) {
				return d.target.y;
			})
		node.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	}

	function dragstarted(d) {
		d3.event.sourceEvent.stopPropagation();
		d3.select(this).classed("dragging", true);
		self.force.start();
	}

	function dragged(d) {
		d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
	}

	function dragended(d) {
		d3.select(this).classed("dragging", false);
		//force.stop();
	}

	function updateOthers() {

		htimeline[self.SID] = [];
		dindex[self.SID] = [];
		var selectedNodes = svg.selectAll(".selected");
		if (selectedNodes) {
			selectedNodes.each(function(d) {
				if ($.inArray(d.uid, dindex[self.SID]) == -1) dindex[self.SID].push(d.uid);
				var dDate = new Date(d.date);
				if ($.inArray(dDate, htimeline[self.SID]) == -1) htimeline[self.SID].push(dDate);
			});
		}
		renderAllExcept(self.Name, "brush");
	}

	function update_mode() {
		if (self.mode == "pan") {
			svg.selectAll(".brush").remove();
		} else {
			self.brush_g = svg.append("g")
				.datum(function() {
					return {
						selected: false,
						previouslySelected: false
					};
				})
				.attr("tabindex", 2)
				.attr("class", "brush")
				.call(self.brush);
			node_g.on("mousedown",
				// mousedown
				function(d) {
					d.fixed = true;
					d3.select(this).classed("sticky", true);
					if (self.shiftKey) {
						d3.select(this).classed("selected", d.selected = !d.selected);
					} else {
						node.classed("selected", function(p) {
							return p.selected = d === p;
						});
					}
					updateOthers();
				}
			);
		}
	}
	d3.selection.prototype.size = function() {
		var n = 0;
		this.each(function() {
			++n;
		});
		return n;
	};
	self.update = function(coorType) {
		events_id = []
		dataset[self.SID]['dDate'].top(Infinity).forEach(function(p, i) {
			events_id.push(p.uid);
		});
		if (coorType === "brush") {
			node.classed("selected", function(d) {
				if ($.inArray(d.uid, dindex[self.SID]) == -1)
					return false;
				else return true;
			});
		} else {
			$.post("network", {
				'events_id': events_id
			}, function(d) {
				link = link.data([]);
				link.exit().remove();
				node = node.data([]);
				node.exit().remove();
				self.force.nodes(d.nodes)
					.links(d.links);
				link = link.data(d.links);
				link.enter().append("line").attr("class", "link")
					.style("stroke", "#FF0000");

				//   node = node.data(nodes, function(d) { return d.id;});
				node = node.data(d.nodes);
				node_g = node.enter().append("g")
					.attr("class", "node")
					.call(self.drag);
				node.append("image")
					.attr("xlink:href", function(d) {
						if (d.node == 'organization') {
							return "static/dashboard/img/organization.png";
						} else if (d.node == 'person') {
							return "static/dashboard/img/person.png";
						} else if (d.node == 'event') {
							return "static/dashboard/img/event.png";
						} else if (d.node == 'footprint') {
							return "static/dashboard/img/footprint.png";
						} else if (d.node == 'resource') {
							return "static/dashboard/img/resource.png";
						}
					})
					.attr("x", -12)
					.attr("y", -12)
					.attr("width", 36)
					.attr("height", 36);

				node.append("text")
					.attr("dx", "-1.95em")
					.attr("dy", "-.95em")
					.text(function(d) {
						return d.name
					});
				self.force.start();
			});
		}
	}
};