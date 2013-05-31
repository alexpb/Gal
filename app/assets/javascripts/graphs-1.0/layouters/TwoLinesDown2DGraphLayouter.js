function TwoLinesDown2DGraphLayouter(graph) {
    this.Graph = graph;
    this.NodeSpacing = 0.2;
    this.SideBoundary = 0.3;
    this.MinFontSize = 9;
    this.GraphRadius = (this.Graph.Width > this.Graph.Height ? this.Graph.Height / 5 : this.Graph.Width / 5);

    this.Layout = function () {
        var length = this.Graph.Nodes.length;
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var maxValue = 0;
        var labelHeight = null;
        var total = 0;
        var topBoundary = 180 / this.Graph.Height;
        var bottomBoundary = topBoundary * 0.3;
        var absoluteTopBoundary = topBoundary * this.Graph.Height;
        var absoluteBottomBoundary = bottomBoundary * this.Graph.Height;
        var absoluteBoundaries = this.Graph.Height * (topBoundary + bottomBoundary);
        var perimeter = ((this.Graph.Height - absoluteBoundaries) * 2);
        var firstRowDone = false;

        for (var i = 0; i < length; i++) {
            if (this.Graph.Nodes[i].Value > maxValue) { maxValue = this.Graph.Nodes[i].Value; }
            total += this.Graph.Nodes[i].Value;
        }

        var axis = this.Graph.Width * this.SideBoundary;
        var axis_counter = this.Graph.Height * topBoundary;

        var degrees = 270;
        var radius = perimeter / (length * 2);
        if (radius > this.Graph.Height / 20) {
            radius = this.Graph.Height / 20;
        }
        var fontSize = radius * 2;

        if (fontSize > 12) {
            fontSize = 12;
        }
        else if (fontSize < this.MinFontSize) {
            fontSize = this.MinFontSize;
            this.Graph.Height = ((length / 2) * (fontSize * 1.2)) + absoluteBoundaries;
            perimeter = ((this.Graph.Height - absoluteBoundaries)); 
            radius = perimeter / (length);
        } 

        for (var i = 0; i < length; i++) {
            var node = this.Graph.Nodes[i];

            var circle = this.FindOrCreateShape(node, node, GraphShapeTypes.Circle);

            circle.Radius = radius * (1 - this.NodeSpacing);
           
            if (firstRowDone != true) {
                if (axis_counter >= this.Graph.Height - absoluteBottomBoundary || i >= length / 2) {
                    firstRowDone = true;
                    axis = this.Graph.Width * (1 - this.SideBoundary);
                    axis_counter = absoluteTopBoundary;
                    degrees = 90;
                }
            } 

            axis_counter += radius;
            circle.X = axis;

            circle.Y = axis_counter;


            axis_counter += radius;
            circle.Color = node.Color;
            circle.StrokeColor = node.StrokeColor;

            if (node.Label == null) { continue; }

            var label = this.FindOrCreateShape(node, node, GraphShapeTypes.Label);

            label.Text = node.Label.Text;
            label.FontSize = fontSize;
            label.X = circle.X;
            label.Y = circle.Y;
            label.Color = node.Label.Color;

            label.Other.rotationDegrees = (degrees);

            if (label.Other.rotationDegrees >= 0 && label.Other.rotationDegrees <= 180) {
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 90;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'start';
                label.Other.diffX = (circle.Radius + 4);
                label.Other.diffY = 4;
            } else {
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 270;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'end';
                label.Other.diffX = -(circle.Radius + 4);
                label.Other.diffY = 4;
            }

            label.X += label.Other.diffX;
            label.Y += label.Other.diffY

        }
        /*
        //masternode
        var masterNode = new GraphNode(graph);
        masterNode.Tooltip = '<h1 class="white center" style="width: 400px;" >' + this.Graph.Title.Text + '</h1>';
        graph.Nodes.push(masterNode);
        var masterCircle = this.FindOrCreateShape(masterNode, masterNode, GraphShapeTypes.Circle);
        masterCircle.Radius = this.Graph.Width / 20;
        masterCircle.X = centerX;
        masterCircle.Y = absoluteTopBoundary;
        masterCircle.Color = '#232323';
        masterCircle.StrokeColor = '#232323';
        //end master node

        var connLength = this.Graph.Connections.length;

        //set connections layout
        for (var i = 0; i < connLength; i++) {
        var conn = this.Graph.Connections[i];
        var conn2 = conn;
        var curve = this.FindOrCreateShape(conn, masterNode, GraphShapeTypes.Curve);

        curve.X1 = conn.Node1.Shapes[0].X;
        curve.Y1 = conn.Node1.Shapes[0].Y;

        curve.X2 = masterNode.Shapes[0].X;
        curve.Y2 = masterNode.Shapes[0].Y;

        curve.CX = centerX;
        curve.CY = centerY;

        var curve2 = this.FindOrCreateShape(conn2, masterNode, GraphShapeTypes.Curve);

        curve2.X1 = masterNode.Shapes[0].X;
        curve2.Y1 = masterNode.Shapes[0].Y;

        curve2.X2 = conn2.Node2.Shapes[0].X;
        curve2.Y2 = conn2.Node2.Shapes[0].Y;

        curve2.CX = centerX;
        curve2.CY = centerY;
        }
        */
        
        var connLength = this.Graph.Connections.length;

        //set connections layout
        for (var i = 0; i < connLength; i++) {
        var conn = this.Graph.Connections[i];
        var curve = this.FindOrCreateShape(conn, node, GraphShapeTypes.Curve);

        curve.X1 = conn.Node1.Shapes[0].X;
        curve.Y1 = conn.Node1.Shapes[0].Y;

        curve.X2 = conn.Node2.Shapes[0].X;
        curve.Y2 = conn.Node2.Shapes[0].Y;

        curve.CX = centerX;
        curve.CY = centerY;
        }
        //}
    };


};

// inherit BaseGraphLayouter
TwoLinesDown2DGraphLayouter.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
TwoLinesDown2DGraphLayouter.prototype.constructor = TwoLinesDown2DGraphLayouter;