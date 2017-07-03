'use strict';


(function() {

	var data = null;
	var campaignId = null;
	var sortedLostSales = null;
	var nStores = null;
	var lostArea = null;
	var lostValues = null;
	var nStoresWithLostSales = null;
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
		var e = document.getElementById('chart3');
		e.innerHTML = '';

		// Update the title.
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
		buildChart3();
		_updateColours();

	}
	
	function buildChart3() {
		var dataset = _.zip(data.feat_to_base, data.base_index, data.is_outlier, data.lost_sales_rank, data.lost_sales);
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
			.orient('bottom')
			.tickFormat(function(d) { return d + "%"; });
		var yAxis = d3.svg.axis()
			.scale(y)
			.ticks(5)
			.orient('left');

		// Axis limits.
		var maxValue = 0;
		nStoresWithLostSales = 0;
		for (var i=0; i < datasetClean.length; i++) {
			if (~datasetClean[i][2]) {
				maxValue = Math.max(maxValue, datasetClean[i][0]);
			}
			if (data.lost_sales[i] > 0) {
				nStoresWithLostSales += 1;
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
				.text('Featured to Base Ratio');
		svg.append('g')
				.attr('class', 'y axis')
				.call(yAxis)
			.append('text')
				.attr('class', 'label')
				.attr('transform', 'rotate(-90)')
				.attr('y', 6)
				.attr('dy', '.71em')
				.style('text-anchor', 'end')
				.text('Base Index')

		// Points
		svg.selectAll('.dot')
			.data(datasetClean)
			.enter().append('circle')
				.attr('class', function(d) {
					if (d[4] <= 0) {
						return 'negative-dot';
					} else {
						return 'dot';
					}
				 })
				.attr('r', 3.5)
				.attr('cx', function(d) { return x(d[0]); })
				.attr('cy', function(d) { return y(d[1]); })


	}

	function _updateColours(updatedBy) {

		// Get the value, and set the other sliders
		var e = document.getElementById('slider3');
		var rawValue = parseFloat(e.value);


		var scaledValue = 1 - rawValue;
		scaledValue  = Math.pow(scaledValue, 0.5);
		scaledValue = _.clamp(scaledValue, 0, 1);
		var index = scaledValue * (nStores - 1);
		index = Math.round(index);
		index = Math.max(index, nStoresWithLostSales);
		var lostSalesLimit = sortedLostSales[index];

		// Update counts.
		document.getElementById('storeCount3').innerHTML = (nStores - index) ;
		document.getElementById('storePerc3').innerHTML = _.round((nStores - index) / nStores * 100, 1);


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


	var e = document.getElementById('slider3');
	e.addEventListener('input', function () {updateColours('slider3')});

})();


