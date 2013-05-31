function GraphSearchBox(graph) {
    this.Graph = graph;
    this.Container = null;
    this.TextBox = null;
    this.Searching = false;
    this._SearchFor = null;
    this.Options = { Delay: 300, DefaultText: 'Search within:', DefaultTextClass: 'graph-search-box-default-text', Styles: { Match: { 'opacity': '1' }, NotMatch: { 'opacity': '0.3'}} };
        
    //create the div element for the search box
    this._Create = function () {
        var self = this;

        //set the graph container position in order to display the search box into it's coordinate system
        $(this.Graph.Container).css({ position: 'relative' });

        //create search box container        
        this.Container = $('<div id="graph-search" class="graph-search"></div>')
            .appendTo($(this.Graph.Container));

        //create search text box
        this.TextBox = $('<input id="graph-search-box" class="graph-search-box" type="text" maxlength="255" />')
            .appendTo(this.Container)
            .val(this.Options.DefaultText)
            .addClass(self.Options.DefaultTextClass)
            .bind('focus', function () {
                if (self.GetText().indexOf(self.Options.DefaultText) == 0) { self.SetText(''); }
            })
            .bind('blur', function () {
                if (self.GetText() == '') {
                    self.SetText(self.Options.DefaultText);
                    self.TextBox.addClass(self.Options.DefaultTextClass);
                }
            })
            .bind('keydown', { graph: this.Graph }, function (event) {
                event.stopPropagation();

                self.TextBox.removeClass(self.Options.DefaultTextClass);
                self._SearchTimeout(event);
            });
    };

    this._Create();

    this.SetText = function (text) {
        this.TextBox.val(text);
    };

    this.GetText = function () {
        return this.TextBox.val();
    };

    this._SearchTimeout = function (event) {
        var self = this;
                
        setTimeout(function () { self.Search(self.GetText()); }, self.Options.Delay);
    };

    this.Search = function (searchFor) {
        if (this._SearchFor == searchFor) { return; }

        searchFor = searchFor.toLowerCase();

        this._SearchFor = searchFor;
        
        var length = this.Graph.Nodes.length;

        for (var i = 0; i < length; i++) {
            var node = this.Graph.Nodes[i];

            if (node.Label == null) { continue; }

            if (searchFor == '') {
                this.Graph.Renderer.SetGraphNodeSvgElementAttributes(node, this.Options.Styles.Match);
                continue;
            }

            if (node.Label.Text.toLowerCase().indexOf(searchFor) < 0) {
                this.Graph.Renderer.SetGraphNodeSvgElementAttributes(node, this.Options.Styles.NotMatch);                                
            } else {
                this.Graph.Renderer.SetGraphNodeSvgElementAttributes(node, this.Options.Styles.Match);                
            }
        }
    }
};