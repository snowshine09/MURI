$.widget("vis.timeline", $.vis.viscontainer, {
	_create: function() {
		var self = this;
		this.Name = this.element.attr("id");
		this.SID = this.Name.split("_")[2];

    $("#timeline_dlg_"+self.SID).parent().addClass('link_'+self.SID);
		var cmb = "timeline_selectbar_" + self.SID;

		$("#" + cmb).attr("selectedIndex", 0).change(function() {
			var x = $("#" + cmb + " option:selected").val();
			generateOthers(self.Name, x);
			$("#" + cmb + " option:selected").removeAttr('selected');
			$("#" + cmb).attr("selectedIndex", 0);
		});
		this.maxFreq = 0;
		for (var i = 0; i < dataset[self.SID]['timeline'].length; i++) {
			date = dataset[self.SID]['timeline'][i][0];
			dataset[self.SID]['timeline'][i][0] = new Date(date);
			if (this.maxFreq < dataset[self.SID]['timeline'][i][1]) {
				this.maxFreq = dataset[self.SID]['timeline'][i][1];
			}
		}
		self.start = new Date(dataset[self.SID]['timeline'][0][0]),
		self.end = new Date(dataset[self.SID]['timeline'][dataset[self.SID]['timeline'].length - 1][0]);
		self.end.setDate(self.end.getDate() + 1);
		self.numDays = Math.round((self.end - self.start) / (24 * 3600 * 1000))
		self.charts = [
			self.barChart()
			.round(d3.time.day.round)
			.x(d3.time.scale()
				.domain([new Date(self.start), new Date(self.end)])
				.rangeRound([0, 10 * 90]))
		];

		d3.selectAll("#" + this.Name)
			.data(self.charts)
			.each(function(method) {
				d3.select(this).call(method);
			});
        timeextent[self.SID] = [self.start, self.end];
	},
	update: function() {
		var self = this;
        var g = d3.select("#" + this.Name).select("g");
		if (htimeline[self.SID].length > 0) {
			
			var x = d3.time.scale()
				.domain([new Date(self.start), new Date(self.end)])
				.rangeRound([0, 10 * 90]);
			self.brush.clear();
			g.select(".brush").call(self.brush);
			g.select("#clip-0-" + self.SID + " rect")
                .attr("width", 0);
			g.select("#clip-1-" + self.SID).selectAll("rect").remove();
			for (var i = 0; i < htimeline[self.SID].length; i++) {
				g.select("#clip-1-" + self.SID)
					.append("rect")
					.attr("x", x(htimeline[self.SID][i]))
					.attr("width", 9)
					.attr("height", 100);
			}
		} else {
            g.select("#clip-0-" + self.SID + " rect")
                .attr("width", 0);
            g.select("#clip-1-" + self.SID).selectAll("rect").remove();
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
			brushDirty, round;
		self.brush = d3.svg.brush();

		function chart(div) {
			var width = x.range()[1],
				height = y.range()[0];
			y.domain([0, self.maxFreq]);

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
						.datum(dataset[self.SID]['timeline']);

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
				self.barWidth = width / self.numDays;
				g.selectAll(".bar").attr("d", barPath);
			});

			function barPath(groups) {
				var path = [],
					i = -1,
					n = groups.length,
					d;
				while (++i < n) {
					d = groups[i];
					path.push("M", x(d[0]), ",", height, "V", y(d[1]), "h" + self.barWidth + "V", height);
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
            for (var i = 0; i < dataset[self.SID]['timeline'].length; i++) {
                var date = dataset[self.SID]['timeline'][i][0];
                if (+date >= +self.brush.extent()[0] && +date <= +self.brush.extent()[1]) {
                    htimeline[self.SID].push(date);
                }
            }
			dindex[self.SID] = [];
			msgID[self.SID] = [];
			if (self.brush.empty()) {
				var div = d3.select(this.parentNode.parentNode.parentNode);
                renderAllExcept('timeline', self.SID, 'brush');
			} else {
				$.ajax({
					url: 'filter_data_by_time/',
					type: 'post',
					data: {
						start: self.brush.extent()[0],
						end: self.brush.extent()[1]
					},
					success: function(xhr) {
						dindex[self.SID] = xhr.entities;
						msgID[self.SID] = xhr.messages;
						renderAllExcept('timeline', self.SID, 'brush');
					}
				})
			}
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

		chart.filter = function(_) {
			if (_) {
				self.brush.extent(_);
			} else {
				self.brush.clear();
			}
			brushDirty = true;
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