function GraphTooltip(graph, hAlign, vAlign, cssClass) {
    this.Graph = graph;
    this.Container = null;
    this.HAlign = hAlign;
    this.VAlign = vAlign;
    this.CssClass = (cssClass === undefined ? "graph-tooltip" : cssClass);    
    this.CloseButton = $('<div class="graph-tooltip-btn-close">X</div>');

    this.Options = { CloseButton: { Enabled: false } };
    
    //create the div element for the tooltip
    this._Create = function () {
        //set the graph container position in order to display the tooltip into it's coordinate system
        $(this.Graph.Container).css({ position: 'relative' });

        //hide the tooltip on this.Graph.Container click                
        $(this.Graph.Container).bind("click", { graph: this.Graph }, function (event) {
            if (event.target !== undefined && event.target.nodeName == 'svg') {
                event.data.graph.Tooltip.Hide();
            }
        });

        //create tooltip container
        this.Container = $('<div id="graph-tooltip" class="' + this.CssClass + '"></div>')
            .appendTo($(this.Graph.Container))
            .bind('mouseleave', function (event) {
                var trigger = event.target.trigger;
                if (trigger !== undefined) { trigger.GraphShape.GraphNode.Graph.Tooltip.Hide(); }
            });        
    };

    //Show the tooltip
    //@trigger - the svg element that the tooltip will attached to
    //html - the tooltip content in html
    this.Show = function (trigger, html) {
        if (this.Container.is(":visible")) { this.Container.hide(); }

        this.Container.html(html + '<div class="tooltip-triangle"></div>');        
        this.Container.get(0).trigger = trigger;

        if (this.Options.CloseButton.Enabled == true) {
            this.Container.prepend(this.CloseButton);
            
            this.CloseButton.bind('click.graph-tooltip-btn-close', { trigger: trigger }, function (event) {
                var trigger = event.data.trigger;
                if (trigger !== undefined) { trigger.GraphShape.GraphNode.Graph.Tooltip.Hide(); }
            });
        }

        //set position
        var pos = this._GetPosition(trigger);
        this.Container.css({ position: 'absolute', top: pos.top, left: pos.left });

        //this.Container.show(); return;
        this.Container.css({ top: pos.top - 20 });
        this.Container.animate({ opacity: "show", top: pos.top }, 500);
    };

    //Hide the tooltip
    this.Hide = function () {
        this.Container.get(0).trigger = undefined;
        this.Container.fadeOut(300);
    };
    
    //Calculate the position of the tooltip
    //@trigger - the svg element that the tooltip will attached to
    this._GetPosition = function (trigger) {
        var top = 0, left = 0;

        if (trigger.nodeName == "circle") {
            left = trigger.cx.baseVal.value;
            top = trigger.cy.baseVal.value;
        } else {
            left = parseInt($(trigger).attr('x'));
            top = parseInt($(trigger).attr('y'));
        }

        //get trigger dimensions
        var triggerBBox = trigger.getBBox();

        //convert left, top and triggerBBox accourding to the svg viewbox       
        left = (left - this.Graph.Renderer.ViewBox.MinX) * this.Graph.Renderer.ViewBox.XRatio;
        top = (top - this.Graph.Renderer.ViewBox.MinY) * this.Graph.Renderer.ViewBox.YRatio;                
        var triggerWidth = triggerBBox.width * this.Graph.Renderer.ViewBox.XRatio;
        var triggerHeight = triggerBBox.height * this.Graph.Renderer.ViewBox.YRatio;

        //todo: this ajustments are tested only with circle

        // adjust top	        
        if (this.VAlign == VAligns.Top) { top -= (this.Container.outerHeight() + triggerHeight / 2); }
        if (this.VAlign == VAligns.Middle) { top -= this.Container.outerHeight() / 2; }
        if (this.VAlign == VAligns.Bottom) { top += triggerHeight / 2; }

        // adjust left        
        if (this.HAlign == HAligns.Left) { left -= (this.Container.outerWidth() + triggerWidth / 2); }
        if (this.HAlign == HAligns.Middle) { left -= this.Container.outerWidth() / 2; }
        if (this.HAlign == HAligns.Right) { left += triggerWidth / 2; }

        return { top: top, left: left };
    }

    this._Create();
};