function prepareNetworkData() {
    // prepare social network data
    // {
    //     "nodes": [{...}, {...}]
    //     "links": [
    //               {"source": ..., "target": ...},
    //               {"source": ..., "target": ...}
    //              ]
    //  }
    var nodes = {}, links = {};
    dDate.top(Infinity).forEach(function(p, i) {
        p.persons.forEach(function(person) {
            var link = {};
            link.source = person.id;
            link.source = nodes[link.source] || 
                (nodes[link.source] = {
                    id:     person.id
                  , name:   person.name
                  , living: person.living
                  , alias:  person.alias
                  , birth:  person.birth
                  , prof:   person.birth
                  , type:   'person'
                  , photo:  person.photo
                });
            person.groups.forEach(function(group) {
                link.target = group.id;
                link.target = nodes[link.target] || 
                    (nodes[link.target] = {
                        id:   group.id
                      , name: group.name
                      , desc: group.desc
                      , category: group.category
                      , type: 'group'
                    });
                link.id = link.source.id + '-' + link.target.id;
                links[link.id] = links[link.id] || JSON.parse(JSON.stringify(link)); // deep copy of link
            });
        });
    });
    nodes = d3.values(nodes);
    links = d3.values(links);

    return {"nodes": nodes, "links": links};
}

//var force = null;
//var nodes = [];
//var links = [];
//var network = null;
//var node = null;
//var link = null;
//
//function initSN() {
//    if (dDate == null) {
//        return null;
//    }
//    var width = 900
//      , height = 900
//    ;
//
//    network = d3.select("#network").append("svg")
//        .attr("width", width)
//        .attr("height", height)
//    ;
//    node = network.selectAll('.node');
//    link = network.selectAll('.link');
//
//    force = d3.layout.force()
//        .gravity(.05)
//        .distance(250)
//        .charge(-320)
//        .nodes(nodes)
//        .links(links)
//        .size([width, height])
//        .on("tick", tick);
//
//    updateSN();
//
//    return network;
//}
//
//function updateSN() {
//    var data = prepareNetworkData();
//    nodes = data.nodes;
//    links = data.links;
//
////    link = link.data(links, function(d) {
////        return d.id;
////    });
//    link = link.data(links);
//    link.enter().append("line")
//      .attr("class", "link")
//      .style("stroke", "#00FFDD");
////    link.exit().remove();
//
////    node = node.data(nodes, function(d) {
////        return d.id;
////    });
//    node = node.data(nodes);
//    node.enter()
//      .append("image")
//      .attr("xlink:href", function(d) {
//          if (d.type == 'group') {
//              return "/static/eventviewer/img/group.png";
//          } 
//          else if (d.type == 'person') {
//              return "/static/eventviewer/img/head.jpg";
//          }
//      })
//      .attr("x", -8)
//      .attr("y", -8)
//      .attr("width", 36)
//      .attr("height", 36)
//      .attr("class", "node")
//      .call(force.drag);
//
//    node.enter().append("text")
//      .attr("dx", "-1.95em")
//      .attr("dy", "-.95em")
//      .text(function(d) { return d.name });
//
////    node.exit().remove();
//
//    force.start();
//}
//
//function tick() {
//    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
//    link.attr("x1", function(d) { return d.source.x; })
//        .attr("y1", function(d) { return d.source.y; })
//        .attr("x2", function(d) { return d.target.x; })
//        .attr("y2", function(d) { return d.target.y; });
//}

function initSN() {
var width = 960,
    height = 500;

var color = d3.scale.category10();

var nodes = [],
    links = [];

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .charge(-400)
    .linkDistance(120)
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("#network").append("svg")
    .attr("width", width)
    .attr("height", height);

var node = svg.selectAll(".node"),
    link = svg.selectAll(".link");

setTimeout(function() {
  var a = {"id":"p6","name":"Abdul Jabar Wahied","living":"Y","alias":null,"birth":null,"prof":null,"type":"person"} ,
    b = {"id":"g2","name":"Rashid Criminal Group","desc":"Sunni","category":"Criminal Group","type":"group"} ,
    c = {"id":"g3","name":"Iranian Special Group","desc":"Shi'a","category":"Military force","type":"group"};
//  d = prepareNetworkData();
//  nodes = d.nodes;
//  links = d.links;
//  nodes.forEach(function(node) {
//      console.log(JSON.stringify(node));
//  });
//  links.forEach(function(link) {
//      console.log(JSON.stringify(link));
//  });
  nodes.push(a, b, c);
  links.push({source: a, target: b, id:'1'}, {source: a, target: c}, {source: b, target: c});
  start();
}, 0);

function start() {
  link = link.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
  link.enter().insert("line", ".node").attr("class", "link");
  link.exit().remove();

  node = node.data(force.nodes(), function(d) { return d.id;});
  node.enter().append("circle").attr("class", function(d) { return "node " + d.id; }).attr("r", 8);
  node.exit().remove();

  force.start();
}

function tick() {
  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })

  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .style("stroke", "#FF0000");
}
}
