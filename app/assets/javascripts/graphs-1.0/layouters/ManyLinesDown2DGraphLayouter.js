function ManyLinesDown2DGraphLayouter(graph) {
    this.Graph = graph;
    this.NodeSpacing = 0.6;
    this.SideBoundary = 0.1;
    this.FontSize = 9;
    this.GraphRadius = (this.Graph.Width > this.Graph.Height ? this.Graph.Height / 5 : this.Graph.Width / 5);

    this.GraphLines = new Array(); //format line key -> array with graph nodes
    this.numColumns = this.GraphLines.length;
    this.columnWidth = this.Graph.Width / this.numColumns;
    this.Graph.Nodes;
    this.RecordMinRadius = 10;
    this.MinRadius = 10;
    this.ArrowHeadSize = 20;

    this.ReverseCY = false;

    this.Layout = function () {
        this.numColumns = this.GraphLines.length;
        this.columnWidth = (this.Graph.Width * (1 - this.SideBoundary * 2)) / this.numColumns;

        for (var k = this.numColumns - 1; k > -1; k--) {
            var tempNodes = this.GraphLines[k];
            var length = tempNodes.length;
            var centerX = this.Graph.Width / 2;
            var centerY = this.Graph.Height / 2;
            var maxValue = 0;
            var labelHeight = null;
            var total = 0;
            var topBoundary = 170 / this.Graph.Height;
            var bottomBoundary = topBoundary * 0.3;
            var absoluteTopBoundary = topBoundary * this.Graph.Height;
            var absoluteBottomBoundary = bottomBoundary * this.Graph.Height;
            var absoluteBoundaries = this.Graph.Height * (topBoundary + bottomBoundary);
            var perimeter = ((this.Graph.Height - absoluteBoundaries));

            for (var i = 0; i < length; i++) {
                if (tempNodes[i].Value > maxValue) { maxValue = tempNodes[i].Value; }
                total += tempNodes[i].Value;
            }

            var axis = this.Graph.Width * 0.1 + this.columnWidth * (k + 0.5);
            var axis_counter = this.Graph.Height * topBoundary;

            var degrees = 270;
            var radius = perimeter / (length * 2);
            if (radius > this.columnWidth / 6) {
                radius = this.columnWidth / 6;
            }
            else if (radius < this.RecordMinRadius) {
                this.Graph.Height = length * this.MinRadius * (1 + this.NodeSpacing) + absoluteBoundaries;
                perimeter = this.Graph.Height - absoluteBoundaries;
                this.RecordMinRadius = radius;
                radius = perimeter / (length * 2);
            }


            for (var i = 0; i < length; i++) {

                var node = tempNodes[i];

                var circle = this.FindOrCreateShape(node, node, GraphShapeTypes.Circle);

                circle.Radius = radius * (1 - this.NodeSpacing);

                //axis_counter += radius;
                circle.X = axis;

                if (length == 1) {
                    circle.Y = this.Graph.Height / 2;
                }
                else {
                    circle.Y = axis_counter;
                }

                axis_counter += radius * 2;
                circle.Color = node.Color;
                circle.StrokeColor = node.StrokeColor;
                if (node.Label == null) { continue; }

                var label = this.FindOrCreateShape(node, node, GraphShapeTypes.Label);

                label.Text = node.Label.Text;
                label.FontSize = this.FontSize;
                label.X = circle.X;

                label.Y = circle.Y;
                label.Color = node.Label.Color;

                //label.Other.rotationDegrees = (degrees);
                if (k == 0) {
                    label.Other.textAnchor = 'end';
                    label.Other.diffX = -(circle.Radius + 4);
                    label.Other.diffY = 4;
                }
                else if (k == this.GraphLines.length - 1) {
                    label.Other.textAnchor = 'start';
                    label.Other.diffX = (circle.Radius + 4);
                    label.Other.diffY = 4;
                }
                else {
                    if (label.Text.length > 20) {
                        label.FontSize -= 0.6;
                    }
                    var labelWidth = (label.Text.length * this.FontSize * 0.6);
                    label.Other.textAnchor = 'start';
                    label.Other.diffX = -(labelWidth / 2) - 4;
                    label.Other.diffY = circle.Radius + 8;
                }
                /*
                if (label.Other.rotationDegrees >= 0 && label.Other.rotationDegrees <= 180) {
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 90;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                    
                } else {
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 270;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'end';
                label.Other.diffX = -(circle.Radius + 4);
                label.Other.diffY = 4;
                }*/

                label.X += label.Other.diffX;
                label.Y += label.Other.diffY

            }
        }

        var connLength = this.Graph.Connections.length;

        //set connections layout
        for (var i = 0; i < connLength; i++) {
            var conn = this.Graph.Connections[i];
            //var curve = this.FindOrCreateShape(conn, node, GraphShapeTypes.Curve);
            var curve = this.FindOrCreateShape(conn, node, GraphShapeTypes.CurveArrow);

            if (conn.ArrowDirection == null) { conn.ArrowDirection = ArrowDirections.Outbound; }

            curve.ArrowDirection = conn.ArrowDirection;
            curve.HeadSize = 10;

            var node1Diff = 0;
            var node2Diff = 0;

            if (curve.ArrowDirection == ArrowDirections.Inbound) { node1Diff = -conn.Node1.Shapes[0].Radius; }
            if (curve.ArrowDirection == ArrowDirections.Outbound) { node2Diff = -conn.Node2.Shapes[0].Radius; }

            curve.X1 = conn.Node1.Shapes[0].X + node1Diff;
            curve.Y1 = conn.Node1.Shapes[0].Y;

            curve.X2 = conn.Node2.Shapes[0].X + node2Diff;
            curve.Y2 = conn.Node2.Shapes[0].Y;

            //curve.CX = conn.Node1.Shapes[0].X + (conn.Node2.Shapes[0].X - conn.Node1.Shapes[0].X) / 2;
            //curve.CY = conn.Node1.Shapes[0].Y - (conn.Node2.Shapes[0].Y - conn.Node1.Shapes[0].Y) / 8;
            curve.CX = conn.Node1.Shapes[0].X + (conn.Node2.Shapes[0].X - conn.Node1.Shapes[0].X) / 2;
            //curve.CY = conn.Node1.Shapes[0].Y; // -(conn.Node2.Shapes[0].Y - conn.Node1.Shapes[0].Y) / 8;


            if (curve.ArrowDirection == ArrowDirections.Inbound) { curve.CY = conn.Node2.Shapes[0].Y; }
            if (curve.ArrowDirection == ArrowDirections.Outbound) {
                if (this.ReverseCY == false) {
                    curve.CY = conn.Node1.Shapes[0].Y;
                } else {
                    curve.CY = conn.Node2.Shapes[0].Y;
                }
            }
        }
    };

};

// inherit BaseGraphLayouter
ManyLinesDown2DGraphLayouter.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
ManyLinesDown2DGraphLayouter.prototype.constructor = ManyLinesDown2DGraphLayouter;