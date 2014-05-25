$.widget("vis.timeline", $.vis.viscontainer, {
  // options: {
  //   dimension: null
  // },
  _create: function() {
    var self = this;
    this.Name = this.element.attr("id");
    alert(this.Name);
    this.SID = this.Name.split("_")[2];
    this.Type = this.Name.split("_")[0].split("#")[1];
    window.filter = function(filters) {
      filters.forEach(function(d, i) {
        self.charts[i].filter(d);
      });
      renderAll();
    };

    window.reset = function(i) {
      self.charts[i].filter(null);
      renderAll();
    };
    var cmb = "timeline_selectbar_" + self.SID;
    $("#" + cmb)
      .change(function() {
        var x = $("#" + cmb + " option:selected").val();
        generateOthers(self.Name, x);
        $("#" + cmb + " option:selected").removeAttr('selected');

      });

    var start = dataset[self.SID]['dDate'].top(1)[0],
      end = dataset[self.SID]['dDate'].bottom(1)[0];
    console.log(end);
    self.charts = [
      self.barChart() //onlu one chart(vis) method in this list
      .dimension(dataset[self.SID]['dDate'])
      .group(dataset[self.SID]['dDate'].group())
      .round(d3.time.day.round)
      .x(d3.time.scale()
        .domain([new Date(2010, 0, 1), new Date(2010, 5, 1)])
        .rangeRound([0, 10 * 90]))
      .filter([dataset[self.SID]['dDate'].top(1)[0].key, dataset[self.SID]['dDate'].bottom(1)[0].key])
    ];
    d3.selectAll("#" + this.Name)
      .data(self.charts)
      .each(function(chart) {
        // console.log(chart);
        chart.on("brush", renderAllButNetwork()).on("brushend", renderAll());
      })
      .each(render);

  },
  update: function() {
    var self = this;

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
      brush = d3.svg.brush(),
      brushDirty,
      dimension,
      group,
      round;

    function chart(div) {
      var width = x.range()[1],
        height = y.range()[0];

      alert("x within chart: " + x);
      y.domain([0, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
          g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          // div.select(".ui-dialog-title").append("a")
          //   .attr("href", "javascript:reset(" + id + ")")
          //   .attr("class", "reset")
          //   .text("reset")
          //   .style("display", "none");

          g = div.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
            .attr("id", "clip-" + id)
            .append("rect")
            .attr("width", width)
            .attr("height", height);

          g.selectAll(".bar")
            .data(["background", "foreground"])
            .enter().append("path")
            .attr("class", function(d) {
              return d + " bar";
            })
            .datum(group.all());

          g.selectAll(".foreground.bar")
            .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
              .attr("x", 0)
              .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
              .attr("x", x(extent[0]))
              .attr("width", x(extent[1]) - x(extent[0]));
          }
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

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
        extent = brush.extent();
      if (round) g.select(".brush")
        .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
        .style("display", null);
      g.select("#clip-" + id + " rect")
        .attr("x", x(extent[0]))
        .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      } else {
        var extent = brush.extent();
        console.log("extent[0]" + (extent[0]));
        // tmp_dimension = dataset[self.SID]['dDate'];
        // console.log("dataset[self.SID]['dDate'] before filterRange:"+dataset[self.SID]['dDate'].top(2).length);
        // tmp_dimension.filterRange(extent[0], extent[1]);
        dindex[self.SID] = [];

        console.log("dataset[self.SID]['dDate']:" + dataset[self.SID]['dDate'].top(Infinity).length);
        dataset[self.SID]['dDate'].top(Infinity).forEach(function(p, i) {
          dindex[self.SID].push(p.uid);
        });
        dataset[self.SID]['dMessage'].top(Infinity).forEach(function(p, i) {
          msgID[self.SID].push(p.uid);
        });

      }
      renderAllExcept([self.Name], "brush");
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
      brush.x(x);
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
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
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

    return d3.rebind(chart, brush, "on");

  },
  destroy: function() {},
});