$.widget("vis.timeline", $.vis.viscontainer, {
	_create: function() {
		var self = this;
		this.Name = this.element.attr("id");
		this.SID = this.Name.split("_")[2];
		var cmb = "timeline_selectbar_" + self.SID;

		$("#" + cmb).attr("selectedIndex", 0).change(function() {
			var x = $("#" + cmb + " option:selected").val();
			generateOthers(self.Name, x);
			$("#" + cmb + " option:selected").removeAttr('selected');
			$("#" + cmb).attr("selectedIndex", 0);
		});

		var start = dataset[self.SID]['dDate'].top(1)[0],
			end = dataset[self.SID]['dDate'].bottom(1)[0];
		self.charts = [
			self.barChart() //onlu one chart(vis) method in this list
			.dimension(dataset[self.SID]['dDate'])
			.group(dataset[self.SID]['dDate'].group())
			.round(d3.time.day.round)
			.x(d3.time.scale()
				.domain([new Date(2010, 0, 1), new Date(2010, 5, 1)])
				.rangeRound([0, 10 * 90]))
			.filter([dataset[self.SID]['dDate'].bottom(1)[0].key, dataset[self.SID]['dDate'].top(1)[0].key])
		];
		d3.selectAll("#" + this.Name)
			.data(self.charts)
			.each(render);

	},
	update: function() {
		var self = this,
			g = d3.select("#" + this.Name).select("g"),
			x = d3.time.scale()
			.domain([new Date(2010, 0, 1), new Date(2010, 5, 1)])
			.rangeRound([0, 10 * 90]);
		if (htimeline[self.SID].length != 0) {
			self.brush.clear();
			g.select(".brush").call(self.brush);
			g.select("#clip-0-" + self.SID + " rect")
				.attr("width", 0);
		}
		g.select("#clip-1-" + self.SID).selectAll("rect").remove();
		for (var i = 0; i < htimeline[self.SID].length; i++) {
			g.select("#clip-1-" + self.SID)
				.append("rect")
				.attr("x", x(htimeline[self.SID][i]))
				.attr("width", 9)
				.attr("height", 100);
		}
	},
	barChart: function() {

		var self = this,
			margin = {
				top: 10,
				right: 10,
				bottom: 20,
				left: 10
			}, //these are all properties with optional default values
			x,
			y = d3.scale.linear().range([100, 0]),
			id = 0,
			axis = d3.svg.axis().orient("bottom"),
			brushDirty, dimension, group, round;
		self.brush = d3.svg.brush();

		function chart(div) {
			var width = x.range()[1],
				height = y.range()[0];
			y.domain([0, group.top(1)[0].value]);

			div.each(function() {
				var div = d3.select(this),
					g = div.select("g");

				// Create the skeletal chart.
				if (g.empty()) {
					g = div.append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					g.append("clipPath")
						.attr("id", "clip-0-" + self.SID)
						.append("rect")
						.attr("width", width)
						.attr("height", height);

					g.append("clipPath")
						.attr("id", "clip-1-" + self.SID)
						.attr("width", 0);

					g.selectAll(".bar")
						.data(["background", "foreground", "highlight"])
						.enter().append("path")
						.attr("class", function(d) {
							return d + " bar";
						})
						.datum(group.all());

					g.selectAll(".foreground.bar")
						.attr("clip-path", "url(#clip-0-" + self.SID + ")");
					g.selectAll(".highlight.bar")
						.attr("clip-path", "url(#clip-1-" + self.SID + ")");

					g.append("g")
						.attr("class", "axis")
						.attr("transform", "translate(0," + height + ")")
						.call(axis);

					// Initialize the brush component with pretty resize handles.
					var gBrush = g.append("g").attr("class", "brush").call(self.brush);
					gBrush.selectAll("rect").attr("height", height);
					gBrush.selectAll(".resize").append("path").attr("d", resizePath);
				}
				g.selectAll(".bar").attr("d", barPath);
			});

			function barPath(groups) {
				var path = [],
					i = -1,
					n = groups.length,
					d;
				while (++i < n) {
					d = groups[i];
					path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
				}
				return path.join("");
			}

			function resizePath(d) {
				var e = +(d == "e"),
					x = e ? 1 : -1,
					y = height / 3;
				return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
			}
		}

		self.brush.on("brushstart.chart", function() {
			var g = d3.select(this.parentNode);
			g.selectAll("#clip-1-" + self.SID + " rect")
				.attr("width", 0);
			g.select("#clip-1-" + self.SID + "").selectAll("rect").remove();
		});

		self.brush.on("brush.chart", function() {
			var g = d3.select(this.parentNode);
			self.extent = self.brush.extent();
			if (round) g.select(".brush")
				.call(self.brush.extent(self.extent = self.extent.map(round)))
				.selectAll(".resize")
				.style("display", null);
			g.select("#clip-0-" + self.SID + " rect")
				.attr("x", x(self.extent[0]))
				.attr("width", x(self.extent[1]) - x(self.extent[0]));
		});

		self.brush.on("brushend.chart", function() {
			htimeline[self.SID] = [];

			if (self.brush.empty()) {
				var div = d3.select(this.parentNode.parentNode.parentNode);
				div.select(".title a").style("display", "none");
				div.select("#clip-0-" + self.SID + " rect").attr("x", null).attr("width", "100%");
				timeextent[self.SID] = [];
			} else {

				timeextent[self.SID] = self.brush.extent();
				dindex[self.SID] = [];
				msgID[self.SID] = [];

				console.log("dataset[self.SID]['dDate']:" + dataset[self.SID]['dDate'].top(Infinity).length);
				dataset[self.SID]['dDate'].top(Infinity).forEach(function(p, i) {

					if (+p.date >= +timeextent[self.SID][0] && +p.date <= +timeextent[self.SID][1]) {
						if ($.inArray(p.uid, dindex[self.SID]) == -1) dindex[self.SID].push(p.uid);
					}

				});
				dataset[self.SID]['dMessage'].group().top(Infinity).forEach(function(p, i) {
					if (+Date.parse(p.key[2]) >= +Date.parse(timeextent[self.SID][0]) && +Date.parse(p.key[2]) <= +Date.parse(timeextent[self.SID][1])) {
						if ($.inArray(p.key[0], msgID[self.SID]) == -1) msgID[self.SID].push(p.key[0]);
					}
				});

			}
			renderAllExcept(self.Name, "brush");
		});

		chart.margin = function(_) {
			if (!arguments.length) return margin;
			margin = _;
			return chart;
		};

		chart.x = function(_) {
			if (!arguments.length) return x;
			x = _;
			axis.scale(x);
			self.brush.x(x);
			return chart;
		};

		chart.y = function(_) {
			if (!arguments.length) return y;
			y = _;
			return chart;
		};

		chart.dimension = function(_) {
			if (!arguments.length) return dimension;
			dimension = _;
			return chart;
		};

		chart.filter = function(_) {
			if (_) {
				self.brush.extent(_);
				//dimension.filterRange(_);
			} else {
				self.brush.clear();
				//dimension.filterAll();
			}
			brushDirty = true;
			return chart;
		};

		chart.group = function(_) {
			if (!arguments.length) return group;
			group = _;
			return chart;
		};

		chart.round = function(_) {
			if (!arguments.length) return round;
			round = _;
			return chart;
		};

		return d3.rebind(chart, self.brush, "on");

	},
});