var graph;
        var colors = new Array('#F6BD0F', '#AFD8F8', '#8BBA00', '#FF8E46', '#008E8E',
        '#F6BD0F', '#AFD8F8', '#8BBA00', '#FF8E46', '#008E8E',
        '#F6BD0F', '#AFD8F8', '#8BBA00', '#FF8E46', '#008E8E',
        '#F6BD0F', '#AFD8F8', '#8BBA00', '#FF8E46', '#008E8E',
        '#F6BD0F', '#AFD8F8', '#8BBA00', '#FF8E46', '#008E8E',
        '#F6BD0F', '#AFD8F8', '#8BBA00', '#FF8E46', '#008E8E',
        '#F6BD0F', '#AFD8F8', '#8BBA00', '#FF8E46', '#008E8E'
        );

        //var baseDataUrl = "http://localhost:9200/blog/blogposts/_search?q=";
        var baseDataUrl = "http://staging1.commetric.com:9200/blog/blogposts/_search?q=";                        
        var nodeLabelMaxLength = 20;

        $(document).ready(function () {

            graph = new Graph($('#graph-test').get(0), 2000, 2000);
            //var graph = new Graph(document.getElementById("graphtest"), 400, 200);

            graph.Layouter = new Bubbles2DGraphLayouter(graph);
            graph.Layouter = new SingleCircular2DGraphLayouter(graph);
            //graph.Layouter = new SingleLine2DGraphLayouter(graph);            
            //graph.Layouter.GraphRadius = 50;
            //graph.Renderer = new RaphaelGraphRenderer(graph);
            graph.Renderer = new JQuerySvgGraphRenderer(graph);
            graph.Tooltip = new GraphTooltip(graph, HAligns.Middle, VAligns.Top);
            graph.NavToolbar = new GraphNavToolbar(graph);
            graph.Legend = new GraphLegend(graph);
            graph.Title = new GraphTitle(graph);
            graph.SearchBox = new GraphSearchBox(graph);


            //get data from BlogMapService

            if (postId > -1 && blogUrl != '') {
                graph.Title.SetTitle('Blog Posts To Entities');

                var searchUrl = baseDataUrl + 'id:' + postId;

                jQuery.ajax({
                    url: searchUrl,
                    type: 'GET',
                    dataType: 'jsonp',
                    jsonpCallback: "LoadPostEntitiesData",
                    cache: false,
                    success: function (json) {
                        //callbackOnLoad();
                    },
                    error: function () {
                        alert('An error occured while retrieving data');
                    }
                });


                return;
            }

            graph.Title.SetTitle('Playground');
            //var colors = new Array('#09a3e2', '#d00978', '#f59a0f', '#4dca13', '#7d7d7d');
            var colors = new Array('#FF9900', '#09a3e2', '#dc052e', '#8bba00', '#8400ff', '#232323', '#FF0099', '#00c0ff', '#d00978', '#f59a0f', '#4dca13', '#666666', '#eed500', '#145cff');
            var start = new Date().getTime();
            var colorIndex = 0;
            var colorsLength = colors.length;
            var dataSerieIndex = 0;
            var dataSeriesLength = 0;

            //create data series
            for (var i = 0; i < 10; i++) {
                var serie = new GraphDataSerie(graph);

                colorIndex = (colorIndex < colorsLength - 1 ? colorIndex + 1 : 0);

                serie.Id = "serie-" + i;
                serie.Color = colors[colorIndex];
                serie.Label = new GraphLabel(serie, "Serie " + i, 12, '#000000');

                graph.DataSeries.push(serie);
            }

            dataSeriesLength = graph.DataSeries.length;

            //create nodes
            //var areas = new Array('NLP Indexation', 'Legal', 'Government', 'Viz Discovery', 'Corporate Communications', 'Patents', 'Marketing CRM', 'Software Plug-Ins', 'Processes', 'Recruitment, Talent & Expertise', 'Scientific, R&D', 'People', 'Market Intelligence & Risk');
            var areas = new Array('Legal', 'Government', 'Corporate Communications', 'Marketing CRM', 'Software Plug-Ins', 'Recruitment, Talent & Expertise', 'Scientific, R&D', 'Market Intelligence & Risk');

            for (var i = 0; i < areas.length; i++) {
                var node = new GraphNode(graph);

                colorIndex = (colorIndex < colorsLength - 1 ? colorIndex + 1 : 0);
                dataSerieIndex = (dataSerieIndex < dataSeriesLength - 1 ? dataSerieIndex + 1 : 0);

                node.Id = "node-" + areas[i];
                node.Value = 0;
                //if (i < colors.length) { node.Color = colors[i]; }
                node.Color = colors[colorIndex];
                node.Label = new GraphLabel(node, '', 16, '#000000');
                node.Tooltip = "Test <b>tooltip</b> for " + node.Label.Text;
                //node.StrokeColor = "#000000";
                //node.StrokeWidth = 5;
                graph.Nodes.push(node);
                graph.DataSeries[dataSerieIndex].AddNode(node);
            }

            var nodesLength = graph.Nodes.length;

            //create connections
            for (var i = 0; i < nodesLength; i++) {
                for (var j = 0; j < nodesLength - 1; j++) {

                    var conn = new GraphConnection(graph.Nodes[i], graph.Nodes[j]);

                    conn.Label = "Connection " + i;
                    conn.StrokeColor = graph.Nodes[i].Color;
                    conn.StrokeWidth = 1;
                    graph.Connections.push(conn);
                }

            }

            //            var conn = new GraphConnection(graph.Nodes[18], graph.Nodes[8]);
            //            conn.Label = "Connection KIRO";
            //            graph.Connections.push(conn);

            //            //test tooltip
            //            graph.Nodes[18].Tooltip = "<a href='http://google.com'>Author</a><br /><a href='http://google.com'>Pattent</a>";


            //console.log("Nodes created for: " + (new Date().getTime() - start) + "ms");
            start = new Date().getTime();

            graph.Layouter.Layout();

            //console.log("Layout created for: " + (new Date().getTime() - start) + "ms");
            start = new Date().getTime();

            graph.Renderer.Render();

            //console.log("Graph rendered for: " + (new Date().getTime() - start) + "ms");


            if (graph.Nodes.length > 100) {
                graph.Renderer.HighlightStyles = graph.Renderer.HighlightFastStyles;
            }

        });


        //load the entities of a single post
        function LoadPostEntitiesData(json) {            
              var hits = (json && json.hits && json.hits.hits ? json.hits.hits : null);
          
              if (hits == null) { return; }
          
              var length = hits.length;
              var entitiesQuery = '';
                    
              for (var i = 0; i < length; i++) {
                    var hit = hits[i];
                    var entities = hit._source.entities;
                    var entitiesLength = entities.length;

                    for (var j = 0; j < entitiesLength; j++) {
                        entity = entities[j];

                        //create the entity nodes
                        var node = new GraphNode(graph);

                        node.Id = "node-entity-" + entity;
                        node.Value = 10;
                        node.Label = new GraphLabel(node, entity, 12, '#000000');
                        node.Tooltip = "<b>Entity:</b> " + entity;
                        node.Color = colors[0];
                        node.StrokeColor = node.Color;

                        graph.Nodes.push(node);

                        //build the entitiesQuery
                        if (entitiesQuery != '') { entitiesQuery += ' OR '; }
                        entitiesQuery += '"' + entity + '"';
                    }                     
              }

              if (entitiesQuery != '') {
                    var searchUrl = baseDataUrl + 'entities:(' + encodeURIComponent(entitiesQuery) + ')';

                    jQuery.ajax({
                        url: searchUrl,
                        type: 'GET',
                        dataType: 'jsonp',
                        jsonpCallback: "LoadEntityPostsData",
                        cache: false,
                        success: function(json) {
                            //callbackOnLoad();
                        },
                        error: function() {
                            alert('An error occured while retrieving data');
                        }
                    });
              }
              
        }

        //load all the posts of the specified entities
        function LoadEntityPostsData(json) {            
              var hits = (json && json.hits && json.hits.hits ? json.hits.hits : null);
          
              if (hits == null) { return; }
          
              var length = hits.length;
                                  
              for (var i = 0; i < length; i++) {
                    var hit = hits[i];
                    var source = hit._source;
                                        
                    //create the post nodes
                    var node = new GraphNode(graph);

                    node.Id = "node-post-id" + source.id;
                    node.Value = 10;
                    node.Label = new GraphLabel(node, (source.title.length > nodeLabelMaxLength ? source.title.substring(0, nodeLabelMaxLength) + '...' : source.title), 12, '#000000');                    
                    node.Tooltip = '<b>Post:</b> <a href="' + source.permalink + '?blogmap_test=1">' + source.title + '</a>';
                        
                    node.Color = colors[2];
                    node.StrokeColor = (source.id == postId ? node.StrokeColor = '#000000' : node.Color);
                    
                    graph.Nodes.push(node);  
                    
                    //create the node's connections
                    var entities = hit._source.entities;
                    var entitiesLength = entities.length;

                    for (var j = 0; j < entitiesLength; j++) {
                        var entity = entities[j];
                        var nodesLength = graph.Nodes.length;
                    
                        for (var k = 0; k < nodesLength; k++) {
                            if (graph.Nodes[k].Id != "node-entity-" + entity) { continue; }

                            var conn = new GraphConnection(node, graph.Nodes[k]);
                            
                            conn.StrokeColor = node.Color;

                            graph.Connections.push(conn);
                        }
                    }                                                                            
              }
              
              graph.Layouter.Layout();
              graph.Renderer.Render();

        }