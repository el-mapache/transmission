define([
  'backbone',
  'underscore',
  'text!templates/tooltips.html'
], function(Backbone, _, Tooltips) {
  // Listens for events requiring altering the user and responds with a friendly tooltip
  var ToolTipView = Backbone.View.extend({
    el: "#tx-container",
    template: _.template(Tooltips),
    
    initialize: function() {
      _.bindAll(this, 'showTooltip');
      
      this.tooltips = {};
      this.dispatcher.on('showTooltip',this.showTooltip)
    },
    
    render: function() {
      this.$el.prepend(this.template());
      this._getTooltips();
      
      return this;
    },
    
    // Find all tooltips on the page and cache them for later display
    _getTooltips: function() {
      var tooltips = this.$el.find('a[data-tooltip-type]'),
          self = this;

      _.each(tooltips, function(tooltip) {
        var $tip = $(tooltip);
        
        $tip.tooltip({trigger: "manual"});
        self.tooltips[($tip.data().tooltipType)] = $tip;
      });
    },
    
    showTooltip: function(type) {
      var tip = this.tooltips[type];
      
      if(typeof tip === undefined) return false;
      
      tip.tooltip('show')
      
      setTimeout(function() {
        tip.tooltip('hide');
      }, 4000);    
    }
  });
  
  return ToolTipView;
});
