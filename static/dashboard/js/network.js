// $.widget("vis.visnetwork", $.vis.viscontainer, {
//   options: {},
//   _create: function() {},
//   destroy: function() {},
// });
SIIL.Network = function(div) {
  var self = this;
  this.SID = div.split("_")[2];
  this.Type = div.split("_")[0].split("#")[1];
  this.Name = this.Type + '_cvs_' + this.SID;
  this.width = $("#network_dlg_" + this.SID).innerWidth(); //outerWidth();
  this.height = $("#network_dlg_" + this.SID).innerHeight() - 121;
  this.brushmode = false;
  this.panmode = false;

  var force = null;
  this.shiftKey = null;
  // color = d3.scale.linear()
  //     .domain([-1, 0, 1])
  //     .range(["red", "white", "green"]);
  // var Xcordscale = d3.scale.linear().domain([-300.0, 1000.0]).range([0, parseFloat(this.width)]),
  //   Ycordscale = d3.scale.linear().domain([-300.0, 1000.0]).range([0, parseFloat(this.height)]);

  var svg = d3.select(div)
    .attr("tabindex", 1)
    .on("keyup", keyflip) //.brush
    .on("keydown", keyflip) //.brush
    .each(function() {
      this.focus();
    })
    .append("svg:svg")
    // .attr("width", 1800)
    // .attr("height", 1300)
    // .attr("viewBox", "0 0 " + 1000 + " " + 800)
    // .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("pointer-events", "all")
    .style("overflow", "scroll") //;
    .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", redraw))
    .append('svg:g')
    .on("mousedown", mousedown);

  var node = svg.selectAll(".node");
  var link = svg.selectAll(".link");

  force = d3.layout.force()
    .nodes([])
    .links([])
    .gravity(0.2)
    .charge(-400)
  // .linkDistance(120)
  .size([self.width, self.height])
    .on("tick", tick);

  $("#network_gravity_" + self.SID).slider({
    value: 0.2,
    max: 1,
    step: 0.01,
    animate: true,
    slide: function(event, ui) {
      force.gravity(ui.value);
      $("#network_gravity_" + self.SID).siblings('.gravity_text').val(ui.value);
      if (force.alpha() == 0) force.start();
      // force.alpha(0.1);
    }
  });
  $("#network_gravity_" + self.SID).siblings('.gravity_text').val($("#network_gravity_" + self.SID).slider("value"));
  // $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
  //   " - $" + $( "#slider-range" ).slider( "values", 1 ) );

  var nodes = force.nodes();
  var links = force.links();

  function keyflip() {
    //alert("shiftKey");
    self.shiftKey = d3.event.shiftKey || d3.event.metaKey;
  }

  function redraw() {
    //alert("redraw");
    svg.attr("transform",
      "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
  }
  // var leftedge = 1000, rightedge = 0, topedge = 100, bottomedge = 0;
  var leftedge, rightedge, topedge, bottomedge;

  function tick() {
    link.attr("x1", function(d) {
      return d.source.x; //Xcordscale(parseFloat(d.source.x));
    })
      .attr("y1", function(d) {
        return d.source.y; //Ycordscale(parseFloat(d.source.y));
      })
      .attr("x2", function(d) {
        return d.target.x; //Xcordscale(parseFloat(d.target.x));
      })
      .attr("y2", function(d) {
        return d.target.y; //Ycordscale(parseFloat(d.target.y));
      })
    node.attr("transform", function(d) {
      if (leftedge == undefined) leftedge = d.x;
      if (rightedge == undefined) rightedge = d.x;
      if (topedge == undefined) topedge = d.y;
      if (bottomedge == undefined) bottomedge = d.y;

      if (d.x < leftedge) leftedge = d.x;
      if (d.x > rightedge) rightedge = d.x;
      if (d.y < topedge) topedge = d.y;
      if (d.y > bottomedge) bottomedge = d.y;
      //return "translate(" + Xcordscale(parseFloat(d.x)) + "," + Ycordscale(parseFloat(d.y)) + ")";
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() {
      ++n;
    });
    return n;
  };



  var self = this;
  this.resize = function() {
    // svg.style("height", $('#' + self.Name).outerHeight())
    //   .style("width", $('#' + self.Name).outerWidth())
  }
  this.update = function(coType) {



    var cmb = "network_selectbar_" + self.SID;
    $("#" + cmb).attr("selectedIndex", 0)//self.table.$('tr').unbind("click").bind("click", function(e) { 
      .unbind("change").bind("change",function() {
        var x = $("#" + cmb + " option:selected").val();
        var selectedNodes = svg.selectAll(".selected");
        // alert(selectedNodes.size());
        // alert(selectedNodes[0].length);
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

    events_id = []
    dataset[self.SID]['dDate'].top(Infinity).forEach(function(p, i) {
      events_id.push(p.uid);
    });

    data = {};
    data['events_id'] = events_id;

    $.post("network", data, function(d) {
      link = link.data([]);
      link.exit().remove();
      node = node.data([]);
      node.exit().remove();
      force.nodes(d.nodes)
        .links(d.links);
      //console.log(d);ƒ
      //
      //    link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
      link = link.data(d.links);
      link.enter().append("line").attr("class", "link")
        .style("stroke", "#FF0000");

      //   node = node.data(nodes, function(d) { return d.id;});
      node = node.data(d.nodes);
      console.log(node);
      node.enter().append("g")
        .attr("class", "node")
        .call(force.drag)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousedown",
          function(d) {
            d.fixed = true;
            d3.select(this).classed("sticky", true);
            if (self.shiftKey) d3.select(this).classed("selected", d.selected = !d.selected);
            else node.classed("selected", function(p) {
              return p.selected = d === p;
            });
          });

      node.append("image")
        .attr("xlink:href", function(d) {
          if (d.node == 'organization') {
            return "{{STATIC_URL}}dashboard/img/organization.png";
          } else if (d.node == 'person') {
            return "{{STATIC_URL}}dashboard/img/person.png";
          } else if (d.node == 'event') {
            return "{{STATIC_URL}}dashboard/img/event.png";
          } else if (d.node == 'footprint') {
            return "{{STATIC_URL}}dashboard/img/footprint.png";
          } else if (d.node == 'resource') {
            return "{{STATIC_URL}}dashboard/img/resource.png";
          }
        })
        .attr("x", -12)
        .attr("y", -12)
        .attr("width", 36)
        .attr("height", 36);
      //    node.append("rect")
      //       .attr("x", -12)
      //       .attr("y", -12)
      //       .attr("width", 40)
      //       .attr("height", 40)
      // .style("fill", "transparent")
      //       ;

      node.append("text")
        .attr("dx", "-1.95em")
        .attr("dy", "-.95em")
        .text(function(d) {
          return d.name
        });

      node.classed("selected", function(d) {
        if ($.inArray(d.uid, dindex[self.SID]) == -1)
          return false;
        else return true;
      });

      force.start();
      force.on("end", function() {
        // alert(self.height + "  " + self.width);
        // alert("top: " + topedge + " bottom: " + bottomedge + "left: " + leftedge + "right: " + rightedge);
      })
    });
    // end new code request data on the fly


  }

  function mouseover() {
    d3.select(this).select("image").transition()
      .duration(450)
      .attr("width", 64)
      .attr("height", 64);
    highlightFromNetwork(this.__data__.id);
  }

  function mouseout() {
    d3.select(this).select("image").transition()
      .duration(450)
      .attr("width", 36)
      .attr("height", 36);
    unhighlightFromNetwork(this.__data__.id);
  }

  function mousedown() {
    // self.brushmode = document.getElementById("network_brush_" + self.SID).checked;
    // self.panmode = document.getElementById("network_pan_" + self.SID).checked;
    // if (self.brushmode) {
    //   d.fixed = true;
    //   d3.select(this).classed("sticky", true);
    //   if (self.shiftKey) d3.select(this).classed("selected", d.selected = !d.selected);
    //   else node.classed("selected", function(p) {
    //     return p.selected = d === p;
    //   });
    // } else if (self.panmode) {
    redraw();
    // }
  }
  var brush = svg.append("g")
    .datum(function() {
      return {
        selected: false,
        previouslySelected: false
      };
    })
    .attr("class", "brush")
    .call(d3.svg.brush()
      .x(d3.scale.identity().domain([0, this.width]))
      .y(d3.scale.identity().domain([0, this.height]))
      .on("brushstart", function(d) {
        node.each(function(d) {
          // console.log(d);
          d.previouslySelected = self.shiftKey && d.selected;
        });
      })
      .on("brush", function() {
        var extent = d3.event.target.extent();
        node.classed("selected", function(d) {
          // if(d.previouslySelected ^
          //   (extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]))
          //   alert(d.node+" is selected");
          // (Xcordscale(parseFloat(extent[0][0])) <= Xcordscale(parseFloat(d.x)) && Xcordscale(parseFloat(d.x)) < Xcordscale(parseFloat(extent[1][0])) && extent[0][1] <= Xcordscale(parseFloat(d.y))  && Ycordscale(parseFloat(d.y))  < Ycordscale(parseFloat(extent[1][1])) );
          return d.selected = d.previouslySelected ^
            (extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]);
        });
      })
      .on("brushend", function() {
        d3.event.target.clear();
        d3.select(this).call(d3.event.target);
        var selectedNodes = svg.selectAll(".selected");
        // alert(selectedNodes.size());
        // alert(selectedNodes[0].length);
        if (selectedNodes) {
          dindex[self.SID] = [];
          selectedNodes.each(function(d) {
            dindex[self.SID].push(d.uid);

          });

        }
        renderAllExcept(self.Name, "brush");
      })
    );



};