'use strict';


(function() {

	var data = null;
	var campaignId = null;
	var sortedLostSales = null;
	var nStores = null;
	var lostArea = null;
	var lostValues = null;
	var lostSalesPerc = null;

	function sortNumbers(a, b) {
		return a - b;
	}

	function loadData(e) {
		// Get current campaign ID.
		var e = document.getElementById('campaignChooser');
		campaignId = e.options[e.selectedIndex].value;
		var jsonUrl = 'https://ajnisbet.github.io/u6gi62erdc4hjslk/data/' + campaignId + '.json';
		// var jsonUrl = 'http://127.0.0.1:8000/u6gi62erdc4hjslk/data/' + campaignId + '.json';

		// Clear the chart.
		var e = document.getElementById('chart');
		e.innerHTML = '';
		var e = document.getElementById('chart2');
		e.innerHTML = '';
		var e = document.getElementById('chart3');
		e.innerHTML = '';

		// Update the title.
		var e = document.getElementById('headingCampaignId');
		e.innerHTML = campaignId;
		var e = document.getElementById('headingCampaignId2');
		e.innerHTML = campaignId;
		var e = document.getElementById('headingCampaignId3');
		e.innerHTML = campaignId;

		fetch(jsonUrl, {
			method: 'get'
		}).then(function(response) {
			return response.json();
		}).catch(function(err) {
			console.log('Error getting data');
		}).then(function(j) {
			console.log('Got data!');
			updateData(j);
		});
	}


	function updateData(d) {
		// Update global dataset.
		data = d;

		// Build d3 dataset.
		nStores = data.store_id.length
		sortedLostSales = data.lost_sales_rank.slice().sort(sortNumbers);
		var dataset = _.zip(data.featured_index, data.base_index, data.is_outlier, data.lost_sales_rank);
		var datasetClean = _.remove(dataset, function(o) { return !o[2]});

		// Compute dimensions.
		var margin = {top: 20, right: 20, bottom: 40, left: 40};
		var width = 500 - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;

		// Axes and scale.
		var x = d3.scale.linear()
			.range([0, width]);
		var y = d3.scale.linear()
			.range([height, 0]);
		var xAxis = d3.svg.axis()
			.scale(x)
			.ticks(5)
			.orient('bottom');
		var yAxis = d3.svg.axis()
			.scale(y)
			.ticks(5)
			.orient('left');

		// Axis limits.
		var maxValue = 0;
		for (var i=0; i < datasetClean.length; i++) {
			if (~datasetClean[i][2]) {
				maxValue = Math.max(maxValue, datasetClean[i][0], datasetClean[i][1]);
			}
		}
		var extent = [0, maxValue];
		x.domain(extent).nice();
		y.domain(extent).nice();

		// Main chart area.
		var svg = d3.select('#chart').append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		// Axis labels
		svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + height + ')')
				.call(xAxis)
			.append('text')
				.attr('class', 'label')
				.attr('x', width)
				.attr('y', -6)
				.style('text-anchor', 'end')
				.text('Featured Sales Index');
		svg.append('g')
				.attr('class', 'y axis')
				.call(yAxis)
			.append('text')
				.attr('class', 'label')
				.attr('transform', 'rotate(-90)')
				.attr('y', 6)
				.attr('dy', '.71em')
				.style('text-anchor', 'end')
				.text('Base Sales Index')

		// Points
		svg.selectAll('.dot')
			.data(datasetClean)
			.enter().append('circle')
				.attr('class', 'dot')
				.attr('r', 3.5)
				.attr('cx', function(d) { return x(d[0]); })
				.attr('cy', function(d) { return y(d[1]); })

		buildChart2();
		buildChart3();
		_updateColours();

	}
	
	function buildChart3() {
		var dataset = _.zip(data.featured_index, data.feat_to_base, data.is_outlier, data.lost_sales_rank);
		var datasetClean = _.remove(dataset, function(o) { return !o[2]});

		// Compute dimensions.
		var margin = {top: 20, right: 20, bottom: 40, left: 40};
		var width = 500 - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;

		// Axes and scale.
		var x = d3.scale.linear()
			.range([0, width]);
		var y = d3.scale.linear()
			.range([height, 0]);
		var xAxis = d3.svg.axis()
			.scale(x)
			.ticks(5)
			.orient('bottom');
		var yAxis = d3.svg.axis()
			.scale(y)
			.ticks(5)
			.orient('left')
			.tickFormat(function(d) { return d + "%"; });

		// Axis limits.
		var maxValue = 0;
		for (var i=0; i < datasetClean.length; i++) {
			if (~datasetClean[i][2]) {
				maxValue = Math.max(maxValue, datasetClean[i][0]);
			}
		}
		var xExtent = [0, maxValue];
		x.domain(xExtent).nice();
		
		var maxValue = 0;
		for (var i=0; i < datasetClean.length; i++) {
			if (~datasetClean[i][2]) {
				maxValue = Math.max(maxValue, datasetClean[i][1]);
			}
		}
		var yExtent = [0, maxValue];
		y.domain(yExtent).nice();

		// Main chart area.
		var svg = d3.select('#chart3').append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		// Axis labels
		svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + height + ')')
				.call(xAxis)
			.append('text')
				.attr('class', 'label')
				.attr('x', width)
				.attr('y', -6)
				.style('text-anchor', 'end')
				.text('Featured Sales Index');
		svg.append('g')
				.attr('class', 'y axis')
				.call(yAxis)
			.append('text')
				.attr('class', 'label')
				.attr('transform', 'rotate(-90)')
				.attr('y', 6)
				.attr('dy', '.71em')
				.style('text-anchor', 'end')
				.text('Featured to Base Ratio')

		// Points
		svg.selectAll('.dot')
			.data(datasetClean)
			.enter().append('circle')
				.attr('class', 'dot')
				.attr('r', 3.5)
				.attr('cx', function(d) { return x(d[0]); })
				.attr('cy', function(d) { return y(d[1]); })


	}

	function buildChart2() {
		var values = data.lost_sales_clip.slice().sort(sortNumbers);
		values.reverse();
		lostValues = values;

		var total = _.sum(lostValues);
		var cum = [];
		lostValues.reduce(function(a,b,i) { return cum[i] = a+b; },0);
		lostSalesPerc = [];
		for (var i = cum.length - 1; i >= 0; i--) {
			lostSalesPerc.push(cum[i] / total);
		}

		// Compute dimensions.
		var margin = {top: 20, right: 20, bottom: 40, left: 40};
		var width = 800 - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;

		// Axes and scale.
		var x = d3.scale.linear()
			.range([0, width])
			.domain([0, values.length]);
		var y = d3.scale.linear()
			.range([height, 0])
			.domain([_.min(values), _.max(values)]);
		var xAxis = d3.svg.axis()
			.scale(x)
			.ticks(5)
			.orient('bottom');
		var yAxis = d3.svg.axis()
			.scale(y)
			.ticks(0)
			.orient('left');


		// Main chart area.
		var svg = d3.select('#chart2').append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		var inner = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');



		// Things
		

		// Axis labels
		svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + height + ')')
				.call(xAxis)
			.append('text')
				.attr('class', 'label')
				.attr('x', width/2)
				.attr('y', 40)
				.style('text-anchor', 'middle')
				.text('Store Rank');
		svg.append('g')
				.attr('class', 'y axis')
				.call(yAxis)
			.append('text')
				.attr('class', 'label')
				.attr('transform', 'rotate(-90)')
				.attr('y', -20)
				.attr('x', -height / 2)
				.attr('dy', '.71em')
				.style('text-anchor', 'middle')
				.text('Lost Sales Amount')

		var line = d3.svg.line()
			.interpolate('basis')
			.x(function(d, i) {return x(i);})
			.y(function(d, i) {return y(d);})

		lostArea = d3.svg.area()
			.x(function(d, i) {return x(i);})
			.y1(function(d, i) {return y(d);})
			.y0(height)


		svg.append('path')
			// .data([values])
			.attr('class', 'area')
			.attr('d', lostArea(values.slice(0, 1000)));

		svg.append('path')
			.attr('class', 'line')
			.attr('d', line(values));
		// Points
		// svg.selectAll('.dot')
		// 	.data(datasetClean)
		// 	.enter().append('circle')
		// 		.attr('class', 'dot')
		// 		.attr('r', 3.5)
		// 		.attr('cx', function(d) { return x(d[0]); })
		// 		.attr('cy', function(d) { return y(d[1]); })




	}


	function _updateColours(updatedBy) {

		// Get the value, and set the other sliders
		if (updatedBy === 'slider2') {
			var e = document.getElementById('slider2');
			document.getElementById('slider').value = e.value;
			document.getElementById('slider3').value = e.value;
		} else if (updatedBy === 'slider3') {
			var e = document.getElementById('slider3');
			document.getElementById('slider').value = e.value;
			document.getElementById('slider2').value = e.value;
		} else {
			var e = document.getElementById('slider');
			document.getElementById('slider2').value = e.value;
			document.getElementById('slider3').value = e.value;

		}
		var rawValue = parseFloat(e.value);


		var scaledValue = 1 - rawValue;
		scaledValue  = Math.pow(scaledValue, 0.5);
		scaledValue = _.clamp(scaledValue, 0, 1);
		var index = scaledValue * (nStores - 1);
		index = Math.round(index);
		var lostSalesLimit = sortedLostSales[index];

		// Update counts.
		document.getElementById('storeCount').innerHTML = (nStores - index) ;
		document.getElementById('storeCount3').innerHTML = (nStores - index) ;
		document.getElementById('storePerc').innerHTML = _.round((nStores - index) / nStores * 100, 1);
		document.getElementById('storePerc3').innerHTML = _.round((nStores - index) / nStores * 100, 1);
		document.getElementById('storePerc2').innerHTML = _.round((nStores - index) / nStores * 100, 1) + '%';
		document.getElementById('percCount').innerHTML = _.round(lostSalesPerc[index] * 100, 0).toString() + '%' ;


		d3.selectAll('.dot')
			.filter(function(d) {
				return d[3] >= lostSalesLimit;
			})
			.each(function(d) {
				d3.select(this).attr('class', 'selected-dot');
			})

		d3.selectAll('.selected-dot')
			.filter(function(d) {
				return d[3] < lostSalesLimit;
			})
			.each(function(d) {
				d3.select(this).attr('class', 'dot');
			})

		d3.select('.area')   // change the line
			.attr('d', lostArea(lostValues.slice(0, nStores - index)));


	}


	var updateColours = _.throttle(_updateColours, 64);

	function median(values) {
		values.sort( function(a,b) {return a - b;} );
		var half = Math.floor(values.length/2);
		if(values.length % 2)
			return values[half];
		else
			return (values[half-1] + values[half]) / 2.0;
	}

	var e = document.getElementById('campaignChooser');
	e.addEventListener('change', loadData);
	loadData();

	var e = document.getElementById('slider');
	e.addEventListener('input', function () {updateColours('slider')});

	var e = document.getElementById('slider2');
	e.addEventListener('input', function () {updateColours('slider2')});

	var e = document.getElementById('slider3');
	e.addEventListener('input', function () {updateColours('slider3')});

})();


