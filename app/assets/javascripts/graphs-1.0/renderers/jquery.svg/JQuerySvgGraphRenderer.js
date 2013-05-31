function JQuerySvgGraphRenderer(graph) {
    this.Graph = graph;
    this._draggedSvgElement = null;
    this.PanRate = 10; // Number of pixels to pan per key press.    
    this.ZoomRate = 1.1; // Must be greater than 1. Increase this value for faster zooming (i.e., less granularity).

    this.HighlightStyles = { All: 'graph-highlight-all', Selected: { Node: 'graph-highlight-selected-node', Connections: 'graph-highlight-selected-connections', InboundConnections: null, OutboundConnections: null, Label: 'graph-highlight-selected-label', Connected: { Nodes: 'graph-highlight-selected-connected-nodes', Labels: 'graph-highlight-selected-connected-labels'}} };
    this.HighlightFastStyles = { All: null, Selected: { Node: 'graph-highlight-fast-selected-node', Connections: 'graph-highlight-fast-selected-connections', InboundConnections: null, OutboundConnections: null, Label: 'graph-highlight-fast-selected-label', Connected: { Nodes: null, Labels: null}} };

    this.Options = { Dragging: { Enabled: true }, Highlighting: { Enabled: true } };
    this.NodesGroup = null;
    this.LabelsGroup = null;
    this.ConnectionsGroup = null;
    this.SvgDefs = null;
    

    this.ViewBox = {
        Graph: this.Graph,
        MinX: 0,
        MinY: 0,
        Width: this.Graph.Width,
        Height: this.Graph.Height,
        XRatio: 1,
        YRatio: 1,
        CalculateRatio: function () {
            this.XRatio = this.Graph.Width / this.Width;
            this.YRatio = this.Graph.Height / this.Height;
            //this.XRatio = this.Graph.Width / (this.Width - this.MinX);
            //this.YRatio = this.Graph.Height / (this.Height - this.MinY);
        },
        Refresh: function (svg) {
            if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }
            //var viewBox = $(svg.root()).attr('viewBox'); // Grab the object representing the SVG element's viewBox attribute.
            var viewBox = $(svg.root()).get(0).getAttribute("viewBox");
            var viewBoxValues = viewBox.split(' '); 			// Create an array and insert each individual view box attribute value (assume they're seperated by a single whitespace character).

            this.MinX = parseFloat(viewBoxValues[0]); 	// Convert string "numeric" values to actual numeric values.
            this.MinY = parseFloat(viewBoxValues[1]);
            this.Width = parseFloat(viewBoxValues[2]);
            this.Height = parseFloat(viewBoxValues[3]);

            this.CalculateRatio();
        },
        Set: function (minX, minY, width, height, svg) {
            //if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }
            this.MinX = minX;
            this.MinY = minY;
            this.Width = width;
            this.Height = height;

            this.Apply(svg, false);
        },
        Apply: function (svg, animate) {
            if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }
            if (animate === undefined) { animate = false; }

            if (animate == false) {
                svg.configure({ viewBox: this.MinX + ' ' + this.MinY + ' ' + this.Width + ' ' + this.Height, preserveAspectRatio: 'none' });
            } else {
                $(svg.root()).animate({ svgViewBox: this.MinX + ' ' + this.MinY + ' ' + this.Width + ' ' + this.Height }, 600);
            }
            this.CalculateRatio();
        }
    };

    this.Render = function () {
        // set conatiner size 
        $(this.Graph.Container).width(graph.Width).height(graph.Height);
                
        //todo: check the right place for this
        this.Graph.Container.Graph = this.Graph;

        // attach svg functionality
        $(this.Graph.Container).svg({
            onLoad: this._SvgOnLoad,
            initPath: 'http://ivan/svggraphtest/js/graphs-1.0/renderers/jquery.svg/jquery.svg.package-1.4.3/',
            overflow: 'hidden'
        });
    }

    this._SvgOnLoad = function (svg) {
        //get instance of the graph object. in this function "this" points to svg
        var graph = svg._container.Graph;

        graph.Renderer._DrawGraph(svg);
    }

    this._DrawGraph = function (svg) {
        if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }

        //detach the svg DOM object for faster rendering. Attach it back on the end of the function
        $(svg._svg).detach();

        this.ViewBox.Set(0, 0, this.Graph.Width, this.Graph.Height, svg);
        svg.configure({ overflow: 'hidden' }, false);

        //svg.title('Commetric Graph Demo');
        //svg.describe('This demo ...');

        //todo: move this events to more appropriate place

        //bind the key press event
        //$(svg.root()).bind('keydown', graph.Renderer.ProcessKeyPress); 
        //$(this).bind('keydown', graph.Renderer.ProcessKeyPress); 
        //todo: find out how to attach the event to the div or svg instead of to the document
        //$(document).bind('keydown', { renderer: graph.Renderer }, graph.Renderer.ProcessKeyPress);
        $(svg._container).attr('tabindex', '0').bind('keydown', { renderer: this }, this.ProcessKeyPress);

        //zoom on mousewheel scroll
        $(svg._container).bind('mousewheel', { renderer: this }, function (event, delta) {
            var zoomType = (delta > 0 ? 'zoom-in' : 'zoom-out');
            event.data.renderer.Zoom(zoomType);
            return false;
        });

        this._AddSvgDefs(svg);

        this.ConnectionsGroup = svg.group('connectionsGroup');
        this.NodesGroup = svg.group('nodesGroup');
        this.LabelsGroup = svg.group('labelsGroup', { "font-size": '12px' });

        this._DrawGraphNodes(svg);

        //set zIndex
        //todo: improve this
        var length = this.Graph.Nodes.length;

        for (var i = 0; i < length; i++) {

            var node = this.Graph.Nodes[i];
            var shapesLength = node.Shapes.length;

            for (var j = 0; j < shapesLength; j++) {
                if (node.Shapes[j].Other && node.Shapes[j].Other.zIndex) {
                    this._SetZIndex(node.Shapes[j].SvgElement, node.Shapes[j].Other.zIndex);
                }

                if (node.Shapes[j].Other && node.Shapes[j].Other.frontBackIndex) {
                    if (node.Shapes[j].Other.frontBackIndex < 0) {
                        this._ToBack(node.Shapes[j].SvgElement);
                    } else {
                        this._ToFront(node.Shapes[j].SvgElement);
                    }
                }
            }
        }

        //draw the connections
        this._DrawGraphConnections(svg);

        //attach the svg DOM node back
        this.Graph.Container.appendChild(svg._svg);
    };

    this._AddSvgDefs = function (svg) {
        if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }

        //add definitions node
        this.SvgDefs = svg.defs('definitions');

        //add markers
        var length = this.Graph.Markers.length;

        for (var i = 0; i < length; i++) {
            var marker = this.Graph.Markers[i];
            
            marker.SvgElement = svg.marker(this.SvgDefs, marker.Id, marker.RefX, marker.RefY, marker.Width, marker.Height, 'auto');
            marker.SvgElement.GraphMarker = marker;
            
            var shapesLength = marker.Shapes.length;

            for (var j = 0; j < shapesLength; j++) {
                var shape = marker.Shapes[j];
                var svgElement = null;

                var settings = {
                    "fill": shape.Color,
                    "stroke": shape.StrokeColor,
                    "strokeWidth": shape.StrokeWidth
                };

                //add other settings (ex. rotation)
                for (var name in shape.Other) { settings[name] = shape.Other[name]; }

                switch (shape.Type) {
                    case GraphShapeTypes.Triangle:

                        svgElement = svg.path(marker.SvgElement, shape.ToPathData(), settings);
                        
                        break;
                }

                svgElement.GraphShape = shape;
                shape.SvgElement = svgElement;

                if (shape.OnRendered != null) { shape.OnRendered(); }
            }
        }
    };

    this._DrawGraphNodes = function (svg, parentNode) {
        if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }
        var nodes = this.Graph.Nodes;
        if (parentNode !== undefined) { nodes = parentNode.ChildNodes; }
        var length = nodes.length;

        //draw the nodes
        for (var i = 0; i < length; i++) {
            var node = nodes[i];
            var shapesLength = node.Shapes.length;
            var nodeConnsLength = node.Connections.length;
            var connToClass = '';

            //build connected to class names
            for (var j = 0; j < nodeConnsLength; j++) {
                if (node.Connections[j].Node1.Id == node.Id) {
                    connToClass += ' connected-to-' + node.Connections[j].Node2.Id;
                } else {
                    connToClass += ' connected-to-' + node.Connections[j].Node1.Id;
                }
            }

            if (node.DataSerie != null) {
                connToClass += ' data-series-' + node.DataSerie.Id;
            }

            for (var j = 0; j < shapesLength; j++) {
                var shape = node.Shapes[j];
                var svgElement = null;

                var settings = {
                    "fill": shape.Color,
                    "stroke": shape.StrokeColor,
                    "strokeWidth": shape.StrokeWidth,
                    "cursor": 'pointer',
                    onmouseover: 'this.GraphShape.GraphNode.Graph.Renderer.HighlightNode(this.GraphShape.GraphNode);' + (shape.OnMouseOver != null ? shape.OnMouseOver : ''),
                    onmouseout: 'this.GraphShape.GraphNode.Graph.Renderer.UnhighlightNode(this.GraphShape.GraphNode);' + (shape.OnMouseOut != null ? shape.OnMouseOut : '')
                };

                //add other settings (ex. rotation)
                for (var name in shape.Other) { settings[name] = shape.Other[name]; }

                //set events javascript as attributes (strings) because it works faster in FF
                switch (shape.Type) {
                    case GraphShapeTypes.Circle:

                        settings.id = node.Id + '-shape-' + j;
                        settings['class'] = 'shape-main attached-to-' + node.Id + ' ' + connToClass;
                        settings.onmousedown = 'this.GraphShape.GraphNode.Graph.Renderer._StartDragging(evt);';
                        settings.onclick = 'this.GraphShape.GraphNode.Graph.Tooltip.Show(this, this.GraphShape.GraphNode.Tooltip);';

                        svgElement = svg.circle(this.NodesGroup, shape.X, shape.Y, shape.Radius, settings);
                        break;

                    case GraphShapeTypes.Rect:

                        settings.id = node.Id + '-shape-' + j;
                        settings['class'] = 'shape-main attached-to-' + node.Id + ' ' + connToClass;
                        settings.onmousedown = 'this.GraphShape.GraphNode.Graph.Renderer._StartDragging(evt);';
                        settings.onclick = 'this.GraphShape.GraphNode.Graph.Tooltip.Show(this, this.GraphShape.GraphNode.Tooltip);';

                        svgElement = svg.rect(this.NodesGroup, shape.X - shape.Width / 2, shape.Y, shape.Width, shape.Height, 0, 0, settings);
                        break;

                    case GraphShapeTypes.Label:

                        settings.fontSize = shape.FontSize;
                        settings['class'] = 'label shape-attached attached-to-' + node.Id + ' ' + connToClass;
                        settings.onclick = "$(this).parent().parent().find('.shape-main.attached-to-" + node.Id + "').click();"

                        svgElement = svg.text(this.LabelsGroup, shape.X, shape.Y, shape.Text, settings);
                        break;
                }

                //                $(svgElement).css({ "fill": shape.Color,
                //                    "stroke": shape.StrokeColor
                //                });

                //$(svgElement).attr("style", 'fill: #009000;');

                //set GraphShape property. don't set it as attribute cuz does not work
                svgElement.GraphShape = shape;
                shape.SvgElement = svgElement;

                //if (shape.OnMouseOver != null) { $(svgElement).bind("mouseover", shape.OnMouseOver); }
                //if (shape.OnMouseOut != null) { $(svgElement).bind("mouseout", shape.OnMouseOut); }
                if (shape.OnRendered != null) { shape.OnRendered(); }
            }

            this._DrawGraphNodes(svg, node);
        }

    };

    this._DrawGraphConnections = function (svg) {
        if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }
        var connLength = this.Graph.Connections.length;

        for (var i = 0; i < connLength; i++) {
            var conn = this.Graph.Connections[i];
            var shapesLength = conn.Shapes.length;

            for (var j = 0; j < shapesLength; j++) {
                var shape = conn.Shapes[j];

                switch (shape.Type) {
                    case GraphShapeTypes.Line:
                        //line(parent, x1, y1, x2, y2, settings)
                        var line = svg.line(this.ConnectionsGroup, shape.X1, shape.Y1, shape.X2, shape.Y2,
                        {
                            "fill": 'none',
                            "stroke": conn.StrokeColor,
                            "strokeWidth": conn.StrokeWidth,
                            "class": 'conn shape-attached attached-to-' + conn.Node1.Id + ' attached-to-' + conn.Node2.Id + ' conn-node1-' + conn.Node1.Id + ' conn-node2-' + conn.Node2.Id + (conn.Node1.DataSerie != null ? ' data-series-' + conn.Node1.DataSerie.Id : '') + (conn.Node2.DataSerie != null ? ' data-series-' + conn.Node2.DataSerie.Id : ''),
                            "marker-start": (shape.MarkerStartId != null ? 'url(#' + shape.MarkerStartId + ')' : null),
                            "marker-end": (shape.MarkerEndId!=null ? 'url(#' + shape.MarkerEndId + ')' : null)
                        });

                        line.GraphShape = shape;
                        shape.SvgElement = line;

                        break;

                    case GraphShapeTypes.Curve:

                        var path = svg.path(this.ConnectionsGroup, shape.ToPathData(),
                        {
                            "fill": 'none',
                            "stroke": conn.StrokeColor,
                            "strokeWidth": conn.StrokeWidth,
                            "class": 'conn shape-attached attached-to-' + conn.Node1.Id + ' attached-to-' + conn.Node2.Id + ' conn-node1-' + conn.Node1.Id + ' conn-node2-' + conn.Node2.Id + (conn.Node1.DataSerie != null ? ' data-series-' + conn.Node1.DataSerie.Id : '') + (conn.Node2.DataSerie != null ? ' data-series-' + conn.Node2.DataSerie.Id : '')
                        });

                        path.GraphShape = shape;
                        shape.SvgElement = path;

                        break;

                    case GraphShapeTypes.CurveArrow:

                        var attachedToClass = '';

                        switch (shape.ArrowDirection) {
                            case ArrowDirections.Inbound: attachedToClass = 'arrow-direction-inbound attached-to-' + conn.Node2.Id + ' inbound-attached-to-' + conn.Node1.Id; break;
                            case ArrowDirections.Outbound: attachedToClass = 'arrow-direction-outbound attached-to-' + conn.Node1.Id + ' outbound-attached-to-' + conn.Node2.Id; break;
                            case ArrowDirections.Both: attachedToClass = 'arrow-direction-both attached-to-' + conn.Node1.Id + ' attached-to-' + conn.Node2.Id; break;
                        }

                        var path = svg.path(this.ConnectionsGroup, shape.ToPathData(),
                        {
                            "fill": conn.StrokeColor,                            
                            "stroke": conn.StrokeColor,
                            "strokeWidth": conn.StrokeWidth,
                            //"class": 'conn shape-attached attached-to-' + conn.Node2.Id + ' conn-node1-' + conn.Node1.Id + ' conn-node2-' + conn.Node2.Id + (conn.Node1.DataSerie != null ? ' data-series-' + conn.Node1.DataSerie.Id : '') + (conn.Node2.DataSerie != null ? ' data-series-' + conn.Node2.DataSerie.Id : '')
                            "class": 'conn shape-attached ' + attachedToClass + ' conn-node1-' + conn.Node1.Id + ' conn-node2-' + conn.Node2.Id + (conn.Node1.DataSerie != null ? ' data-series-' + conn.Node1.DataSerie.Id : '') + (conn.Node2.DataSerie != null ? ' data-series-' + conn.Node2.DataSerie.Id : '')
                        });

                        path.GraphShape = shape;
                        shape.SvgElement = path;

                        break;

                    case GraphShapeTypes.CubicCurveArrow:

                        var attachedToClass = '';

                        switch (shape.ArrowDirection) {
                            case ArrowDirections.Inbound: attachedToClass = 'arrow-direction-inbound attached-to-' + conn.Node1.Id; break;
                            case ArrowDirections.Outbound: attachedToClass = 'arrow-direction-outbound attached-to-' + conn.Node1.Id; break;
                            case ArrowDirections.Both: attachedToClass = 'arrow-direction-both attached-to-' + conn.Node1.Id + ' attached-to-' + conn.Node2.Id; break;
                        }

                        var path = svg.path(this.ConnectionsGroup, shape.ToPathData(),
                        {
                            "fill": conn.StrokeColor,
                            "stroke": conn.StrokeColor,
                            "strokeWidth": conn.StrokeWidth,
                            //"class": 'conn shape-attached attached-to-' + conn.Node2.Id + ' conn-node1-' + conn.Node1.Id + ' conn-node2-' + conn.Node2.Id + (conn.Node1.DataSerie != null ? ' data-series-' + conn.Node1.DataSerie.Id : '') + (conn.Node2.DataSerie != null ? ' data-series-' + conn.Node2.DataSerie.Id : '')
                            "class": 'conn shape-attached ' + attachedToClass + ' conn-node1-' + conn.Node1.Id + ' conn-node2-' + conn.Node2.Id + (conn.Node1.DataSerie != null ? ' data-series-' + conn.Node1.DataSerie.Id : '') + (conn.Node2.DataSerie != null ? ' data-series-' + conn.Node2.DataSerie.Id : '')
                        });

                        path.GraphShape = shape;
                        shape.SvgElement = path;

                        break;
                }
            }
        }
    };

    this._RemoveAllGraphConnections = function (svg) {
        if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }
        
        var length = this.ConnectionsGroup.childNodes.length;

        for (var i = length - 1; i >= 0; i--) {
            this._RemoveSvgElement(svg, this.ConnectionsGroup.childNodes[i]);
        }
    }

    this._RemoveAllGraphNodes = function (svg) {
        if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }

        var length = this.NodesGroup.childNodes.length;

        for (var i = length - 1; i >= 0; i--) {
            this._RemoveSvgElement(svg, this.NodesGroup.childNodes[i]);
        }

        length = this.LabelsGroup.childNodes.length;

        for (var i = length - 1; i >= 0; i--) {
            this._RemoveSvgElement(svg, this.LabelsGroup.childNodes[i]);
        }
    }

    this._RemoveSvgElement = function (svg, element) {
        if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }

        svg.remove(element);
    }

    this._RemoveGraphNodes = function (nodes, svg) {
        if (svg === undefined) { svg = $(this.Graph.Container).svg('get'); }

        var length = nodes.length;

        for (var i = length - 1; i >= 0; i--) {
            var node = nodes[i];
            //if (node.Shapes === undefined) { continue; }
            var shapes = node.Shapes;
            var shapesLength = shapes.length;

            for (var j = shapesLength - 1; j >= 0; j--) {
                if (shapes[j].SvgElement == null) { continue; }
                this._RemoveSvgElement(svg, shapes[j].SvgElement);
            }

            this._RemoveGraphNodes(node.ChildNodes, svg);

            //            if (node.Label != null) { 
            //            
            //            }
        }
    }

    this.UpdateNodeLabel = function (node, text) {
        var length = node.Shapes.length;

        //if (node.Label) { node.Label.Shapes[0].SvgElement.firstChild.nodeValue = text; }
        //return;

        for (var j = 0; j < length; j++) {
            var shape = node.Shapes[j];

            switch (shape.Type) {
                case GraphShapeTypes.Label:
                    node.Label.Text = text;
                    shape.SvgElement.firstChild.nodeValue = node.Label.Text;
                    return;
                    break;
            }
        }
    };

    //@element - svg element
    //@attr - json list of attributes (example: {'fill' : 'none'})
    this.SetSvgElementAttributes = function (element, attr) {
        var svg = $(this.Graph.Container).svg('get');
        svg.change(element, attr);        
    };

    //@node - GraphNode
    //@attr - json list of attributes (example: {'fill' : 'none'})
    this.SetGraphNodeSvgElementAttributes = function (node, attr) {
        var length = node.Shapes.length;

        for (var j = 0; j < length; j++) {
            this.SetSvgElementAttributes(node.Shapes[j].SvgElement, attr);
        }

    };

    //@element - svg element
    this._ToFront = function (element) {
        $(element).appendTo($(element).parent());
    }

    //@element - svg element
    this._ToBack = function (element) {
        $(element).prependTo($(element).parent());
    }

    //@element - svg element
    this._SetZIndex = function (element, zIndex) {
        $(element).insertBefore($(element).parent().children().eq(zIndex + 1));
        ////$(element).insertBefore($(element).parent().children(':eq(' + zIndex  + ')'));
    }

    this._StartDragging = function (event) {
        if (this.Options.Dragging.Enabled == false) { return; }

        var svgElement = event.target;
        var node = svgElement.GraphShape.GraphNode;
        var offsetX = event.layerX;
        var offsetY = event.layerY;

        //hide tooltip
        node.Graph.Tooltip.Hide();

        //set cursor 
        $(svgElement).addClass('graph-dragged');
        $(node.Graph.Container).addClass('graph-dragged');

        if (svgElement.nodeName == "circle") {
            offsetX -= svgElement.cx.baseVal.value;
            offsetY -= svgElement.cy.baseVal.value;
        } else {
            offsetX -= parseInt($(svgElement).attr('x'));
            offsetY -= parseInt($(svgElement).attr('y'));
        }

        this._draggedSvgElement = svgElement;

        //move attached shapes to node to front
        var length = node.Shapes.length;

        for (var i = 0; i < length; i++) {
            var shape = node.Shapes[i];

            //todo: fix this. this is needed in order to peserve the bubbles layout
            if (shape.Other && shape.Other.zIndex) { continue; }

            this._ToFront(shape.SvgElement);
        }

        //disable events
        svgElement.onmouseover_tmp = svgElement.onmouseover;
        svgElement.onmouseout_tmp = svgElement.onmouseout;
        svgElement.onmouseover = null;
        svgElement.onmouseout = null;

        //        //get attached to this node connections 
        //        var connections = new Array();
        //        var connLength = node.Graph.Connections.length;

        //        for (var i = 0; i < connLength; i++) {
        //            var conn = node.Graph.Connections[i];

        //            if (conn.Node1 == node || conn.Node2 == node) {
        //                connections.push(conn);

        //                //move connections to front
        //                var shapesLength = conn.Shapes.length;

        //                for (var j = 0; j < shapesLength; j++) {
        //                    var shape = conn.Shapes[j];

        //                    this._ToFront(shape.SvgElement);
        //                }
        //            }
        //        }

        var connections = node.Connections;
        var connLength = node.Connections.length;

        for (var i = 0; i < connLength; i++) {
            var conn = node.Connections[i];

            //move connections to front
            var shapesLength = conn.Shapes.length;

            for (var j = 0; j < shapesLength; j++) { this._ToFront(conn.Shapes[j].SvgElement); }
        }

        $(this.Graph.Container).bind("mousemove", { svgElement: svgElement, offsetX: offsetX, offsetY: offsetY, connections: connections }, this._Drag);
        $(this.Graph.Container).bind("mouseup", { svgElement: svgElement }, this._EndDragging);
    }

    this._EndDragging = function (event) {
        var svgElement = event.data.svgElement;
        var node = svgElement.GraphShape.GraphNode;
        var graph = node.Graph;

        $(graph.Container).unbind('mousemove');
        $(graph.Container).unbind('mouseup');

        //set cursor        
        $(svgElement).removeClass('graph-dragged');
        $(node.Graph.Container).removeClass('graph-dragged');

        //enable events
        svgElement.onmouseover = svgElement.onmouseover_tmp;
        svgElement.onmouseout = svgElement.onmouseout_tmp;
        svgElement.onmouseover_tmp = null;
        svgElement.onmouseout_tmp = null;

//        //todo: improve this
//        //fix zIndex if needed
//        var shapesLength = node.Shapes.length;

//        for (var j = 0; j < shapesLength; j++) {
//            if (node.Shapes[j].Other && node.Shapes[j].Other.zIndex) {
//                graph.Renderer._SetZIndex(node.Shapes[j].SvgElement, node.Shapes[j].Other.zIndex);
//            }
//        }

        graph.Renderer._draggedSvgElement = null;
    }

    this._Drag = function (event) {

        //move the dragged svg element and all related elements        
        var draggedSvgElement = event.data.svgElement;
        var node = draggedSvgElement.GraphShape.GraphNode;
        var length = node.Shapes.length;
        var pos = {
            left: (event.layerX / node.Graph.Renderer.ViewBox.XRatio) + node.Graph.Renderer.ViewBox.MinX, // - event.data.offsetX,
            top: (event.layerY / node.Graph.Renderer.ViewBox.YRatio) + node.Graph.Renderer.ViewBox.MinY // - event.data.offsetY
        };

        for (var i = 0; i < length; i++) {
            var shape = node.Shapes[i];
            var diffX = (shape.Other.diffX !== undefined ? shape.Other.diffX : 0);
            var diffY = (shape.Other.diffY !== undefined ? shape.Other.diffY : 0);
            var rotationDegrees = shape.Other.rotationDegrees;

            shape.X = pos.left;
            shape.Y = pos.top;

            if (shape.SvgElement.nodeName == "circle") {
                graph.Renderer.SetSvgElementAttributes(shape.SvgElement, { "cx": shape.X, "cy": shape.Y });

            } else if (shape.SvgElement.nodeName == "rect") {

                if ($(shape.SvgElement).attr('rotationDegrees') === undefined || $(shape.SvgElement).attr('rotationDegrees') == '') {
                    shape.X -= shape.Width / 2;
                    shape.Y -= shape.Width / 2;

                    graph.Renderer.SetSvgElementAttributes(shape.SvgElement, { "x": shape.X, "y": shape.Y });
                } else {
                    shape.X = shape.X + ((shape.Width / 2) * Math.cos(rotationDegrees + 90));
                    shape.Y = shape.Y + ((shape.Width / 2) * Math.sin(rotationDegrees + 90));

                    graph.Renderer.SetSvgElementAttributes(shape.SvgElement, { 'transform': 'rotate(' + rotationDegrees + ', ' + shape.X + ', ' + shape.Y + ')', 'x': shape.X + diffX, 'y': shape.Y + diffY });
                }

            } else {
                if ($(shape.SvgElement).attr('rotationDegrees') == '') {
                    graph.Renderer.SetSvgElementAttributes(shape.SvgElement, { "x": shape.X, "y": shape.Y });
                } else {
                    graph.Renderer.SetSvgElementAttributes(shape.SvgElement, { 'transform': 'rotate(' + rotationDegrees + ', ' + shape.X + ', ' + shape.Y + ')', 'x': shape.X + diffX, 'y': shape.Y + diffY });
                }
            }
        }

        //move the related connections        
        var connections = event.data.connections;
        var connLength = connections.length;

        for (var i = 0; i < connLength; i++) {
            var conn = connections[i];

            var shapesLength = conn.Shapes.length;

            for (var j = 0; j < shapesLength; j++) {
                var shape = conn.Shapes[j];

                switch (shape.Type) {
                    case GraphShapeTypes.Line:
                        if (conn.Node1 == node) {
                            shape.X1 = pos.left;
                            shape.Y1 = pos.top;
                        } else {
                            shape.X2 = pos.left;
                            shape.Y2 = pos.top;
                        }

                        graph.Renderer.SetSvgElementAttributes(shape.SvgElement, { "x1": shape.X1, "y1": shape.Y1, "x2": shape.X2, "y2": shape.Y2 });
                        break;

                    case GraphShapeTypes.Curve:
                    case GraphShapeTypes.CurveArrow:

                        if (conn.Node1 == node) {
                            shape.X1 = pos.left;
                            shape.Y1 = pos.top;
                        } else {
                            shape.X2 = pos.left;
                            shape.Y2 = pos.top;
                        }

                        graph.Renderer.SetSvgElementAttributes(shape.SvgElement, { "d": shape.ToPathData() });

                        break;
                }


            }
        }
    }

    this.HighlightNode = function (node) {
        this._SetHighlightStyles(node, true);        
    };

    this.UnhighlightNode = function (node) {        
        this._SetHighlightStyles(node, false);
    };

    this._SetHighlightStyles = function (node, highlight) {
        if (this.Options.Highlighting.Enabled == false) { return; }
        //do not Highlight during dragging
        if (this._draggedSvgElement != null) { return; }        

        var styles = this.HighlightStyles;

        //set all nodes style to styles.All (example: fade-out)
        if (styles.All != null) {
            if (highlight == true) {
                $(this.Graph.Container).find('#nodesGroup, #connectionsGroup, #labelsGroup').addClass(styles.All);
            } else {
                $(this.Graph.Container).find('#nodesGroup, #connectionsGroup, #labelsGroup').removeClass(styles.All);
            }
        }

        //set all attached connections to selected node style to styles.Selected.Connections (example: fade-in)
        if (styles.Selected.Connections != null) {
            if (highlight == true) {
                $(this.Graph.Container).find('.conn.attached-to-' + node.Id + ', ' + '.conn.connected-to-' + node.Id).addClass(styles.Selected.Connections);
            } else {
                $(this.Graph.Container).find('.conn.attached-to-' + node.Id + ', ' + '.conn.connected-to-' + node.Id).removeClass(styles.Selected.Connections);
            }
        }

        //set all attached connections to selected node style to styles.Selected.InboundConnections (example: fade-in)
        if (styles.Selected.InboundConnections != null) {
            if (highlight == true) {
                $(this.Graph.Container).find('.conn.inbound-attached-to-' + node.Id).addClass(styles.Selected.InboundConnections);
            } else {
                $(this.Graph.Container).find('.conn.inbound-attached-to-' + node.Id).removeClass(styles.Selected.InboundConnections);
            }
        }

        if (styles.Selected.OutboundConnections != null) {
            if (highlight == true) {
                $(this.Graph.Container).find('.conn.outbound-attached-to-' + node.Id).addClass(styles.Selected.OutboundConnections);
            } else {
                $(this.Graph.Container).find('.conn.outbound-attached-to-' + node.Id).removeClass(styles.Selected.OutboundConnections);
            }
        }

        //InboundConnections: null, OutboundConnections: null,

        //set all attached labels to selected node style to styles.Selected.Label (example: fade-in)
        if (styles.Selected.Label != null) {
            if (highlight == true) {
                $(this.Graph.Container).find('.label.attached-to-' + node.Id).addClass(styles.Selected.Label);
            } else {
                $(this.Graph.Container).find('.label.attached-to-' + node.Id).removeClass(styles.Selected.Label);
            }
        }

        //set selected node style to styles.Selected.Node (example: outline)
        if (styles.Selected.Node != null) {
            if (highlight == true) {
                $(this.Graph.Container).find('.shape-main.attached-to-' + node.Id).addClass(styles.Selected.Node);
            } else {
                $(this.Graph.Container).find('.shape-main.attached-to-' + node.Id).removeClass(styles.Selected.Node);
            }
        }

        //set selected node style to styles.Selected.Connected.Nodes (example: fade-in)
        if (styles.Selected.Connected.Nodes != null) {
            if (highlight == true) {
                $(this.Graph.Container).find('.shape-main.connected-to-' + node.Id).addClass(styles.Selected.Connected.Nodes);
            } else {
                $(this.Graph.Container).find('.shape-main.connected-to-' + node.Id).removeClass(styles.Selected.Connected.Nodes);
            }
        }

        //set selected node style to styles.Selected.Connected.Labels (example: fade-in)
        if (styles.Selected.Connected.Labels != null) {
            if (highlight == true) {
                $(this.Graph.Container).find('.label.connected-to-' + node.Id).addClass(styles.Selected.Connected.Labels);
            } else {
                $(this.Graph.Container).find('.label.connected-to-' + node.Id).removeClass(styles.Selected.Connected.Labels);
            }
        }
    };
    
    this.ProcessKeyPress = function (event) {
        var leftArrow = 37, upArrow = 38, rightArrow = 39, downArrow = 40, plus = 107, minus = 109;
        var renderer = event.data.renderer;
        
        switch (event.keyCode) {
            case leftArrow: renderer.Pan('left'); break;
            case rightArrow: renderer.Pan('right'); break;
            case upArrow: renderer.Pan('up'); break;
            case downArrow: renderer.Pan('down'); break;
            case plus: renderer.Zoom('zoom-in'); break;
            case minus: renderer.Zoom('zoom-out'); break;
        }
    };

    this.Pan = function (direction, panRate) {
        if (panRate === undefined) { panRate = this.PanRate; }
        var animate = false;
        //hide tooltip
        if (this.Graph.Tooltip != null) { this.Graph.Tooltip.Hide(); }

        switch (direction) {
            case 'left':
                this.ViewBox.MinX += panRate; // Increase the x-coordinate value of the viewBox attribute to pan right.
                break;
            case 'right':
                this.ViewBox.MinX -= panRate; // Decrease the x-coordinate value of the viewBox attribute to pan left.
                break;
            case 'up':
                this.ViewBox.MinY -= panRate; // Increase the y-coordinate value of the viewBox attribute to pan down.
                break;
            case 'down':
                this.ViewBox.MinY += panRate; // Decrease the y-coordinate value of the viewBox attribute to pan up.      
                break;
            case 'home':
                this.ViewBox.MinX = 0;
                this.ViewBox.MinY = 0;
                this.ViewBox.Width = this.Graph.Width;
                this.ViewBox.Height = this.Graph.Height;
                animate = true;
                break;
        } // switch

        this.ViewBox.Apply(undefined, animate);
    }

    this.Zoom = function (zoomType, zoomRate) {
        if (zoomRate === undefined) { zoomRate = this.ZoomRate; }

        //hide tooltip
        if (this.Graph.Tooltip != null) { this.Graph.Tooltip.Hide(); }

        if (zoomType == 'zoom-in') {
            this.ViewBox.MinX += (this.ViewBox.Width - (this.ViewBox.Width / zoomRate)) / 2; // Increase the x and y attributes of the viewBox attribute to zoom out.
            this.ViewBox.MinY += (this.ViewBox.Height - (this.ViewBox.Height / zoomRate)) / 2;
            this.ViewBox.Width /= zoomRate; // Decrease the width and height attributes of the viewBox attribute to zoom in.
            this.ViewBox.Height /= zoomRate;
        }
        else if (zoomType == 'zoom-out') {
            this.ViewBox.MinX -= ((this.ViewBox.Width * zoomRate) - this.ViewBox.Width) / 2; // Decrease the x and y attributes of the viewBox attribute to zoom in.
            this.ViewBox.MinY -= ((this.ViewBox.Height * zoomRate) - this.ViewBox.Height) / 2;
            this.ViewBox.Width *= zoomRate; // Increase the width and height attributes of the viewBox attribute to zoom out.
            this.ViewBox.Height *= zoomRate;
        }

        this.ViewBox.Apply();
    };

    this.ShowHideDataSerie = function (dataSerie, visible) {
        if (visible == false) {
            $(this.Graph.Container).find('.data-series-' + dataSerie.Id).each(function (index, domEle) {
                $(domEle).hide();

                if (domEle._hiddenByDataSeriesCount === undefined) { domEle._hiddenByDataSeriesCount = 0; }

                domEle._hiddenByDataSeriesCount++;
            });
        } else {
            $(this.Graph.Container).find('.data-series-' + dataSerie.Id).each(function (index, domEle) {
                if (domEle._hiddenByDataSeriesCount === undefined) { domEle._hiddenByDataSeriesCount = 1; }

                domEle._hiddenByDataSeriesCount--;

                if (domEle._hiddenByDataSeriesCount <= 0) { $(domEle).show(); }
            });
        }

        //show/hide sub datsSeries
        if (dataSerie.DataSeries.length > 0) {
            var length = dataSerie.DataSeries.length;
            
            for (var i = 0; i < length; i++) {
                this.ShowHideDataSerie(dataSerie.DataSeries[i], visible);
            }
        }
    };

    this.ShowHideNode = function (node, visible) {
        if (visible == false) {
            $(this.Graph.Container).find('.attached-to-' + node.Id).hide();
        } else {
            $(this.Graph.Container).find('.attached-to-' + node.Id).show();
        }
    };

    this.Translate = function () {

        $(this.Graph.Container).find('.shape-main, .label').each(function (index) {
            var svgElement = this;
            var shape = svgElement.GraphShape;

            if (svgElement.nodeName == "text") {
                shape.GraphNode.Graph.Renderer.SetSvgElementAttributes(svgElement, shape.Other);
            }

            if (svgElement.nodeName == "circle") {
                $(svgElement).animate({ svgCx: shape.X, svgCy: shape.Y, svgR: shape.Radius }, 2000);
            } else {
                $(svgElement).animate({ svgX: shape.X, svgY: shape.Y }, 2000);
            }
        });

        var connLength = graph.Connections.length;

        //set connections layout
        for (var i = 0; i < connLength; i++) {
            var conn = graph.Connections[i];
            var shapesLength = conn.Shapes.length;

            for (var j = 0; j < shapesLength; j++) {
                var shape = conn.Shapes[j];

                //this.SetSvgElementAttributes(shape.SvgElement, { "d": shape.ToPathData() });
                $(shape.SvgElement).animate({ svgPath: shape.ToPathData() }, 2000);
            }
        }
    };

};

// inherit BaseGraphRenderer
JQuerySvgGraphRenderer.prototype = new BaseGraphRenderer();
// correct the constructor pointer because it points to BaseGraphRenderer
JQuerySvgGraphRenderer.prototype.constructor = JQuerySvgGraphRenderer;