SIIL.Network = function($div, link_no) {
  var self = this;
  self.SID = link_no;
  self.Type = 'network';
  self.Name = 'network_cvs_' + self.SID;
  self.width = 800;
  self.height = 700;
  self.mode = "pan";
  $("#network_dlg_" + self.SID).parent().addClass("link_" + self.SID);
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

  $("#network_dlg_" + self.SID).find('.showcontext').click(function(event) {
    event.preventDefault();
    self.parentID = $div.find('.showcontext').parent().attr('id').split("_")[2];
    if(network[self.parentID]!=undefined){
      
    } else alert("Parent link has already been removed!");
  });

  $("#network_mode_" + self.SID).click(function(e) {
    e.preventDefault();
    if ($('#network_mode_' + self.SID).text() == 'Pan mode') {
      self.mode = "brush";
      $('#network_mode_' + self.SID).text('Brush mode');
      self.force.stop();
    } else {
      self.mode = "pan";
      $('#network_mode_' + self.SID).text('Pan mode');
      self.force.start();
    }
    update_mode();
  });

  ////make all views of the same upmost level
  // $("#network_dlg_" + self.SID).parent().on('click', function() {

  //   var index_highest = 0;
  //   // var prev_zi = $("#wb_dlg_" + wbID).parent(".ui-dialog").attr("z-index");
  //   // find the highest index among opened dialogs
  //   $(".ui-dialog").each(function() {
  //     // always use a radix when using parseInt
  //     var index_current = parseInt($(this).css("zIndex"), 10); //10 refers to the numerical system under use
  //     if (index_current > index_highest) {
  //       index_highest = index_current;
  //     }
  //     if(!$(this).hasClass('link_'+self.SID))$(this).find('.ui-dialog-content').dialogExtend("minimize");
  //   });
  //   //set the clicked one upfront in terms of the layered position
  //   $(".link_"+self.SID).css("zIndex", index_highest + 1);

  // });

  self.force = d3.layout.force()
    .nodes([])
    .links([])
    .gravity(0.2)
    .charge(-400)
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

  $('#' + self.Name).click(function(e) {
    e.preventDefault();
    if (e.target.nodeName === 'rect') {
      node.classed('selected', function() {
        return false;
      });
      updateOthers();
    }
  });
  $("#network_gravity_" + self.SID).slider({
    value: 0.2,
    max: 0.45,
    step: 0.01,
    animate: true,
    slide: function(event, ui) {
      self.force.gravity(ui.value);
      $("#network_gravity_" + self.SID).siblings(".gravity_text").html(ui.value);
      if (self.force.alpha() == 0) self.force.start();
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
    }).attr("y1", function(d) {
      return d.source.y;
    }).attr("x2", function(d) {
      return d.target.x;
    }).attr("y2", function(d) {
      return d.target.y;
    });
    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
  }

  function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }

  function dragended(d) {
    d3.select(this).classed("dragging", false);
  }

  function updateOthers() {
    $('#' + self.Name).parents('.ui-dialog-content').find('.selected-count').text(svg.selectAll('.selected')[0].length);
    var selectedIds = [];
    svg.selectAll('.selected').each(function(d) {
      selectedIds.push(d.uid);
    });
    propagate('network', self.SID, selectedIds);
  }

  function update_mode() {
    node_g.on("mousedown", function(d) {
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
    });
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
    }
  }
  d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() {
      ++n;
    });
    return n;
  };
  self.highlight = function() {
    node.classed("selected", function(d) {
      if ($.inArray(d.uid, dindex[self.SID]) == -1)
        return false;
      else return true;
    });
    $('#' + self.Name).parents('.ui-dialog-content').find('.selected-count').text(svg.selectAll('.selected')[0].length);
  };
  self.update = function(update_type) {
    var self = this;
    if (update_type === "init") {
      events_id = []
      for (var i = 0; i < dataset[self.SID]['event'].length; i++) {
        events_id.push(dataset[self.SID]['event'][i].uid);
      }
      $.ajax({
        url: 'network/',
        type: 'post',
        data: {
          'events_id': events_id
        },
        success: function(xhr) {
          link = link.data([]);
          link.exit().remove();
          node = node.data([]);
          node.exit().remove();
          self.force.nodes(xhr.nodes).links(xhr.links);
          link = link.data(xhr.links);
          link.enter().append("line").attr("class", "link");
          node = node.data(xhr.nodes);
          node_g = node.enter().append("g")
            .attr("class", "node")
            .call(self.drag);
          node.append("image")
            .attr("xlink:href", function(d) {
              if (d.node == 'Organization') {
                return "static/dashboard/img/organization.png";
              } else if (d.node == 'Person') {
                return "static/dashboard/img/person.png";
              } else if (d.node == 'Event') {
                return "static/dashboard/img/event.png";
              } else if (d.node == 'Footprint') {
                return "static/dashboard/img/footprint.png";
              } else if (d.node == 'Resource') {
                return "static/dashboard/img/resource.png";
              }
            }).attr("x", -12)
            .attr("y", -12)
            .attr("width", 24)
            .attr("height", 24);

          node.append("text")
            .attr("dx", "-1.95em")
            .attr("dy", "-.95em")
            .text(function(d) {
              return d.name
            });
          self.force.start();
          update_mode();
          self.highlight();
        }
      });
    } else {
      self.highlight();
    }
  }
};