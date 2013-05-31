function Graph(container, width, height) {
    this.Nodes = new Array();    
    this.Connections = new Array();
    this.DataSeries = new Array();
    this.NodesGroups = new Array();
    this.Markers = new Array();
    this.Container = container;
    this.Width = width;
    this.Height = height;
    this.Title = null;
    this.SubTitle = null;
    this.Layouter = null;
    this.Renderer = null;
    this.Tooltip = null;
    this.Legend = null;
    this.NavToolbar = null;
    this.SearchBox = null;

    //*****************************************************************************
    // DataSeries functions
    //*****************************************************************************
    this.FindOrCreateDataSerie = function (id, color, labelText, labelFontSize) {
        var dataSerie = this.GetDataSerieById(id);

        if (dataSerie == null) { dataSerie = this.CreateDataSerie(id, color, labelText, labelFontSize); }

        return dataSerie;
    }

    this.GetDataSerieById = function (id) {
        var length = this.DataSeries.length;

        for (var i = 0; i < length; i++) {
            if (this.DataSeries[i].Id == id) { return this.DataSeries[i]; }
        }

        return null;
    };

    this.CreateDataSerie = function (id, color, labelText, labelFontSize) {
        var dataSerie = new GraphDataSerie(this, color);
        dataSerie.Id = id;
        dataSerie.Label = new GraphLabel(dataSerie, labelText, labelFontSize);
        this.DataSeries.push(dataSerie);

        return dataSerie;
    };

    //*****************************************************************************
    // NodesGroups functions
    //*****************************************************************************
    this.FindOrCreateNodesGroup = function (id, color, labelText, labelFontSize) {
        var group = this.GetNodesGroupById(id);

        if (group == null) { group = this.CreateNodesGroup(id, color, labelText, labelFontSize); }

        return group;
    }

    this.GetNodesGroupById = function (id) {
        var length = this.NodesGroups.length;

        for (var i = 0; i < length; i++) {
            if (this.NodesGroups[i].Id == id) { return this.NodesGroups[i]; }
        }

        return null;
    };

    this.CreateNodesGroup = function (id, color, labelText, labelFontSize) {
        var group = new GraphNodesGroup(this, color);
        group.Id = id;
        group.Label = new GraphLabel(group, labelText, labelFontSize);
        this.NodesGroups.push(group);

        return group;
    };

    //*****************************************************************************
    // Nodes functions
    //*****************************************************************************
    this.GetNodeById = function (id, parentNode) {
        var nodes = (parentNode !== undefined ? parentNode.ChildNodes : this.Nodes);
        var length = nodes.length;

        for (var i = 0; i < length; i++) {            
            if (nodes[i].Id == id) { return nodes[i]; }

            var childNode = this.GetNodeById(id, nodes[i]);
            
            if (childNode != null) { return childNode; }
        }

        return null;
    };
};

function GraphObject(graph) {
    this.Graph = graph;
    this.Id = null;        
    this.Color = null;
    this.StrokeColor = null;
    this.StrokeWidth = null;
    this.Shapes = new Array();    
};

function GraphNode(graph, dataSerie, nodeGroup) {
    GraphObject.call(this, graph);   
    this.Value = null;
    this.Label = null;
    this.Tooltip = null;
    this.DataSerie = null;
    this.NodesGroup = null;
    this.ParentNode = null;
    this.Connections = new Array();
    this.ChildNodes = new Array();

    if (dataSerie !== undefined) {
        this.DataSerie = dataSerie;
        this.DataSerie.Nodes.push(this);
    }

    if (nodeGroup !== undefined) {
        this.NodesGroup = nodeGroup;
        this.NodesGroup.Nodes.push(this);
    }
    
    this.AddChildNode = function (node) {
        this.ChildNodes.push(node);
        node.ParentNode = this;
    }

    this.CalculateValueFromChildNodes = function (parentNode) {
        var currNode = (parentNode !== undefined ? parentNode : this);
        var nodes = currNode.ChildNodes;
        var length = nodes.length;
        var totalValue = 0;

        //calculate maxValue and labelHeight for faster rendering later
        for (var i = 0; i < length; i++) {
            if (nodes[i].Value != null) {
                totalValue += nodes[i].Value;
                //console.log('   ' + nodes[i].Id + ': ' + nodes[i].Value);
            }

            totalValue += this.CalculateValueFromChildNodes(nodes[i]);
        }

        if (currNode.Value == null) {
            currNode.Value = totalValue;
            //console.log(currNode.Id + ': ' + currNode.Value);
        }

        return totalValue;
    };
};

function GraphConnection(node1, node2, arrowDirection) {
    GraphObject.call(this, node1.Graph);
    this.Node1 = node1;
    this.Node2 = node2;
    this.Label = null;
    this.ArrowDirection = null;

    node1.Connections.push(this);
    node2.Connections.push(this);

    if (arrowDirection !== undefined) {
        this.ArrowDirection = arrowDirection;
    }
};

//@graphObject - graphObject which the label is for.
function GraphLabel(graphObject, text, fontSize, color) {
    GraphObject.call(this, graphObject.Graph);
    this.For = graphObject;
    this.Text = text;
    this.FontSize = fontSize;
    if (color !== undefined) { this.Color = color; }
};

function GraphDataSerie(graph, color) {
    GraphObject.call(this, graph);
    this.Label = null;
    this.Nodes = new Array();
    this.DataSeries = new Array();
    this.ParentDataSerie = null;
    if (color !== undefined) { this.Color = color; }

    this.AddNode = function (node) {
        this.Nodes.push(node);
        node.DataSerie = this;
    }

    this.NodesCount = function () {
        var count = this.Nodes.length;
        var length = this.DataSeries.length;

        for (var i = 0; i < length; i++) {
            count += this.DataSeries[i].NodesCount();
        }

        return count;
    }

    //*****************************************************************************
    // DataSeries functions
    //*****************************************************************************
    this.FindOrCreateDataSerie = function (id, color, labelText, labelFontSize) {
        var dataSerie = this.GetDataSerieById(id);

        if (dataSerie == null) { dataSerie = this.CreateDataSerie(id, color, labelText, labelFontSize); }

        return dataSerie;
    }

    this.GetDataSerieById = function (id) {
        var length = this.DataSeries.length;

        for (var i = 0; i < length; i++) {
            if (this.DataSeries[i].Id == id) { return this.DataSeries[i]; }
        }

        return null;
    };

    this.CreateDataSerie = function (id, color, labelText, labelFontSize) {
        var dataSerie = new GraphDataSerie(this, color);
        dataSerie.Id = id;
        dataSerie.Label = new GraphLabel(dataSerie, labelText, labelFontSize);
        this.DataSeries.push(dataSerie);

        dataSerie.ParentDataSerie = this;

        return dataSerie;
    };
};

function GraphNodesGroup(graph, color) {
    GraphObject.call(this, graph);
    this.Label = null;
    this.Nodes = new Array();
    if (color !== undefined) { this.Color = color; }

    this.AddNode = function (node) {
        this.Nodes.push(node);
        node.NodesGroup = this;
    }
};

function GraphMarker(graph, id, refX, refY, width, height) {
    GraphObject.call(this, graph);
    this.Id = id;       
    this.RefX = refX;
    this.RefY = refY;
    this.Width = width;
    this.Height = height;
    this.SvgElement = null;
};

var GraphShapeTypes = { Circle: 10, Rect: 20, Label: 30, Triangle: 40, Line: 100, Curve: 110, CurveArrow: 120 };
var HAligns = { Left: 10, Middle: 20, Right: 30 };
var VAligns = { Top: 10, Middle: 20, Bottom: 30 };
var ArrowDirections = { Inbound: 10, Outbound: 20, Both: 30 };

function GraphShape(graphNode) {
    this.GraphNode = graphNode;
    this.Color = null;
    this.StrokeColor = null;
    this.StrokeWidth = null;
    this.X = 0;
    this.Y = 0;
    this.Width = null;
    this.Height = null;
    this.Type = null;
    this.HAlign = HAligns.Left;
    this.VAlign = VAligns.Top;
    this.SvgElement = null;
    //this.RotateSettings = null;
    this.OnRendered = null;
    this.OnMouseOver = null;
    this.OnMouseOut = null;
    //other settings
    this.Other = {}; 
};

function GraphCircleShape(graphNode, radius) {
    GraphShape.call(this, graphNode);
    this.Radius = radius;
    this.Type = GraphShapeTypes.Circle;
    this.HAlign = HAligns.Middle;
    this.VAlign = VAligns.Middle;
}

// inherit GraphShape
GraphCircleShape.prototype = new GraphShape();
// correct the constructor pointer because it points to GraphShape
GraphCircleShape.prototype.constructor = GraphCircleShape;

function GraphRectShape(graphNode, width, height) {
    GraphShape.call(this, graphNode);
    this.Width = width;
    this.Height = height;
    this.Type = GraphShapeTypes.Rect;
    this.HAlign = HAligns.Middle;
    this.VAlign = VAligns.Middle;
}

// inherit GraphShape
GraphRectShape.prototype = new GraphShape();
// correct the constructor pointer because it points to GraphShape
GraphRectShape.prototype.constructor = GraphRectShape;

function GraphLabelShape(graphNode, text, fontSize) {
    GraphShape.call(this, graphNode);
    this.Text = text;
    this.Type = GraphShapeTypes.Label;
    this.FontSize = fontSize;
}

// inherit GraphShape
GraphLabelShape.prototype = new GraphShape();
// correct the constructor pointer because it points to GraphShape
GraphLabelShape.prototype.constructor = GraphLabelShape;

function GraphLineShape(graphNode, x1, y1, x2, y2, markerStartId, markerEndId, markerMidId) {
    GraphShape.call(this, graphNode);
    this.X1 = x1;
    this.Y1 = y1;
    this.X2 = x2;    
    this.Y2 = y2;
    this.Type = GraphShapeTypes.Line;
    this.MarkerStartId = (markerStartId !== undefined ? markerStartId : null);
    this.MarkerMidId = (markerMidId !== undefined ? markerMidId : null);
    this.MarkerEndId = (markerEndId !== undefined ? markerEndId : null);
}

// inherit GraphShape
GraphLineShape.prototype = new GraphShape();
// correct the constructor pointer because it points to GraphShape
GraphLineShape.prototype.constructor = GraphLineShape;

function GraphCurveShape(graphNode, x1, y1, cx, cy, x2, y2) {
    GraphShape.call(this, graphNode);
    this.X1 = x1;
    this.X2 = x2;
    this.CX = cx;
    this.CY = cy;
    this.Y1 = y1;
    this.Y2 = y2;
    this.Type = GraphShapeTypes.Curve;

    this.ToPathData = function () {
        return "M" + this.X1 + ',' + this.Y1 + ' Q' + this.CX + ',' + this.CY + ' ' + this.X2 + ',' + this.Y2;
    };
}

// inherit GraphShape
GraphCurveShape.prototype = new GraphShape();
// correct the constructor pointer because it points to GraphShape
GraphCurveShape.prototype.constructor = GraphCurveShape;

function GraphCurveArrowShape(graphNode, x1, y1, cx, cy, x2, y2, headSize, headOffset) {
    GraphShape.call(this, graphNode);
    this.X1 = x1;
    this.X2 = x2;
    this.CX = cx;
    this.CY = cy;
    this.Y1 = y1;
    this.Y2 = y2;
    this.Type = GraphShapeTypes.CurveArrow;
    this.ArrowDirection = ArrowDirections.Outbound;
    if (headSize != undefined) {
        this.HeadSize = headSize;
    }
    else {
        this.HeadSize = 20;
    }
    if (headOffset != undefined) {
        this.HeadOffset = headOffset;
    }
    else {
        this.HeadOffset = 0;
    }

    this.ToPathData = function () {
        var a_fatness = (20 * 3.14) / 180;

        var mainX = this.X1;
        var mainY = this.Y1;

        switch (this.ArrowDirection) {
            case ArrowDirections.Outbound: mainX = this.X2; mainY = this.Y2; break
        }

        var alpha = 1.57 - Math.atan2((mainY - this.CY), (mainX - this.CX));
        var a_X1 = mainX - Math.sin(alpha + a_fatness) * (this.HeadSize + this.HeadOffset);
        var a_X2 = mainX - Math.sin(alpha - a_fatness) * (this.HeadSize + this.HeadOffset);
        var a_X3 = mainX - Math.sin(alpha) * (this.HeadOffset);
        var a_Y1 = mainY - Math.cos(alpha + a_fatness) * (this.HeadSize + this.HeadOffset);
        var a_Y2 = mainY - Math.cos(alpha - a_fatness) * (this.HeadSize + this.HeadOffset);
        var a_Y3 = mainY - Math.cos(alpha) * (this.HeadOffset);

        switch (this.ArrowDirection) {
            case ArrowDirections.Outbound:
                return "M" + this.X1 + ',' + this.Y1 + ' Q' + this.CX + ',' + this.CY + ' ' + this.X2 + ',' + this.Y2 + "M" + a_X3 + ',' + a_Y3 + ' L' + a_X1 + ',' + a_Y1 + ' ' + a_X2 + ',' + a_Y2 + ' ' + a_X3 + ',' + a_Y3 + ' Q' + this.CX + ',' + this.CY + ' ' + this.X1 + ',' + this.Y1;
                break
            case ArrowDirections.Inbound:
                return "M" + this.X1 + ',' + this.Y1 + "M" + a_X3 + ',' + a_Y3 + ' L' + a_X1 + ',' + a_Y1 + ' ' + a_X2 + ',' + a_Y2 + ' ' + a_X3 + ',' + a_Y3 + ' Q' + this.CX + ',' + this.CY + ' ' + this.X2 + ',' + this.Y2 + ' Q' + this.CX + ',' + this.CY + ' ' + this.X1 + ',' + this.Y1;
                break;
        }        
    };
}

// inherit GraphShape
GraphCurveArrowShape.prototype = new GraphShape();
// correct the constructor pointer because it points to GraphShape
GraphCurveArrowShape.prototype.constructor = GraphCurveArrowShape;

function GraphTriangleShape(graphNode, x1, y1, x2, y2, x3, y3) {
    GraphShape.call(this, graphNode);
    this.X1 = x1;
    this.Y1 = y1;
    this.X2 = x2;        
    this.Y2 = y2;
    this.X3 = x3;
    this.Y3 = y3;
    this.Type = GraphShapeTypes.Triangle;

    this.ToPathData = function () {
        return "M" + this.X1 + ',' + this.Y1 + ' L' + this.X2 + ',' + this.Y2 + ' L' + this.X3 + ',' + this.Y3 + ' z';
    };
}

// inherit GraphShape
GraphTriangleShape.prototype = new GraphShape();
// correct the constructor pointer because it points to GraphShape
GraphTriangleShape.prototype.constructor = GraphTriangleShape;


//***************************************************************************************************
// BaseGraphLayouter
//***************************************************************************************************
function BaseGraphLayouter(graph) {
    this.Graph = graph;

    this.Layout = function () { alert('Not implemented'); };

    this.FindOrCreateShape = function (parent, graphNode, shapeType) {
        var shape = this.FindShape(parent, shapeType);

        if (shape == null) { shape = this.CreateShape(parent, graphNode, shapeType); }

        return shape;
    }

    this.FindShape = function (parent, shapeType) {
        var length = parent.Shapes.length;

        for (var i = 0; i < length; i++) {
            if (parent.Shapes[i].Type == shapeType) {
                return parent.Shapes[i];
            }
        }

        return null;
    }

    this.CreateShape = function (parent, graphNode, shapeType) {
        var shape = null;

        switch (shapeType) {
            case GraphShapeTypes.Circle:
                shape = new GraphCircleShape(graphNode);
                break;

            case GraphShapeTypes.Rect:
                shape = new GraphRectShape(graphNode);
                break;

            case GraphShapeTypes.Label:
                shape = new GraphLabelShape(graphNode);
                break;

            case GraphShapeTypes.Triangle:
                shape = new GraphTriangleShape(graphNode);
                break;

            case GraphShapeTypes.Curve:
                shape = new GraphCurveShape(graphNode);
                break;

            case GraphShapeTypes.CurveArrow:
                shape = new GraphCurveArrowShape(graphNode);
                break;

            case GraphShapeTypes.Line:
                shape = new GraphLineShape(graphNode);
                break;
        }

        parent.Shapes.push(shape);

        return shape;
    }

    this.GetNodesMaxValueAndMaxLabelHeight = function (parentNode) {
        var nodes = (parentNode !== undefined ? parentNode.ChildNodes : this.Graph.Nodes);
        var length = nodes.length;
        var maxValue = 0;
        var maxLabelHeight = 0;
        
        //calculate maxValue and labelHeight for faster rendering later
        for (var i = 0; i < length; i++) {
            if (nodes[i].Label != null) {

                //create a temp span in order to calculate the size (BBox) of the label
                var spanBBox = $('<span/>').appendTo(nodes[i].Graph.Container).hide().text(this.Graph.Nodes[i].Label.Text).css('font-size', nodes[i].Label.FontSize);

                labelHeight = spanBBox.width();
                spanBBox.remove();

                if (labelHeight > maxLabelHeight) { maxLabelHeight = labelHeight; }

            }

            if (nodes[i].Value > maxValue) { maxValue = nodes[i].Value; }
            
            labelHeight = 0;

            var settings = this.GetNodesMaxValueAndMaxLabelHeight(nodes[i]);

            if (settings.maxLabelHeight > maxLabelHeight) { maxLabelHeight = settings.maxLabelHeight; }
            if (settings.maxValue > maxValue) { maxValue = settings.maxValue; }
        }

        return { maxValue: maxValue, maxLabelHeight: maxLabelHeight };
    };
};

//***************************************************************************************************
// BaseGraphRenderer
//***************************************************************************************************
function BaseGraphRenderer(graph) {
    this.Graph = graph;
    this.Canvas = null;

    this.Render = function () { alert('Not implemented'); };
    this.Translate = function () { alert('Not implemented'); };

    //@param ms number The duration of the animation, given in milliseconds.
    //@param easing string [“>”, “<”, “<>”, “backIn”, “backOut”, “bounce”, “elastic”, “cubic-bezier(p1, p2, p3, p4)”] or function [optional],
    this.MoveShape = function (shape, dx, dy, ms, easing) {
        alert('Not implemented');       
    };
};