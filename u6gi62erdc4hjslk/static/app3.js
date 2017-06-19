'use strict';


(function() {

	var data = null;
	var campaignId = null;
	var sortedLostSales = null;
	var nStores = null;
	var nStoresWithLostSales = null;
	var lostArea = null;
	var lostValues = null;
	var lostValuesReal = null;
	var lostValuesRealPos = null;
	var lostSalesPerc = null;
	var lostSalesCum = null;
	var lostStoresPerc = null;
	var lostSalesEfficiency = null;
	var nowScanningDays = 30;
	var totalNRetailerStores = 0;


	var campaignDetails = {
		'OIQ000100': {
			'retailer': 'Walmart',
			'nRetailerStores': 4602,
			'vendor': 'Unilever',
			'campaignName': 'Omni Hair Unilever Walmart Q4',
		},
		'OIQ001544': {
			'retailer': 'Ahold',
			'nRetailerStores': 800,
			'vendor': 'Clorox',	
			'campaignName': 'demo KC BBQ @ Ahold Part 3',
		},
		'VAL001481': {
			'retailer': 'Ahold',
			'nRetailerStores': 800,
			'vendor': 'Unilever',
			'campaignName': 'Unilever-Mindshare-Ahold Holiday Skin Q4',
		}
	}

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
		var e = document.getElementById('chart2');
		e.innerHTML = '';

		// Update the title.
		document.getElementById('headingCampaignId2').innerHTML = campaignId;


		// Update the details
		var details = campaignDetails[campaignId];
		document.getElementById('campaignName').innerHTML = details.campaignName;
		document.getElementById('vendor').innerHTML = details.vendor;
		document.getElementById('retailer').innerHTML = details.retailer;
		totalNRetailerStores = details.nRetailerStores;

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

		if (document.getElementById('inc').checked) {
			for (var i = 0; i < data.days_since_last_scan.length; i++) {
				if (data.days_since_last_scan[i] > nowScanningDays) {
					data.lost_sales_clip[i] = 0;
					data.lost_sales_clip_neg[i] = 0;
					data.lost_sales[i] = 0;
				}
			}
		}

		// Build d3 dataset.
		nStores = data.store_id.length
		sortedLostSales = data.lost_sales_rank.slice().sort(sortNumbers);

		buildChart2();
		_updateColours();

	}
	

	function buildChart2() {
		// console.log(data);
		var values = data.lost_sales_clip_neg.slice().sort(sortNumbers);
		values.reverse();
		lostValues = values;


		var valuesReal = data.lost_sales.slice().sort(sortNumbers);
		valuesReal.reverse();
		lostValuesReal = valuesReal.slice();
		lostValuesRealPos = valuesReal.slice();
		for (var i = 0; i < lostValuesRealPos.length; i++) {
			lostValuesRealPos[i] = _.clamp(lostValuesRealPos[i], 0, _.max(lostValuesRealPos));
		}

		// Compute some values
		totalNRetailerStores = Math.max(totalNRetailerStores, data.days_since_last_scan.length);
		var nScanningStores = 0;
		nStoresWithLostSales = 0;
		var totalLostSales = 0;
		for (var i = data.days_since_last_scan.length - 1; i >= 0; i--) {
			if (data.days_since_last_scan[i] < nowScanningDays) {
				nScanningStores += 1;
			}
			if (data.lost_sales[i] > 0) {
				nStoresWithLostSales += 1;
				totalLostSales += data.lost_sales[i];	
			}
		}
		document.getElementById('nRetailerStores').innerHTML = totalNRetailerStores.toString();
		document.getElementById('featuredAmount').innerHTML = nScanningStores.toString();
		document.getElementById('featuredPerc').innerHTML = Math.round(nScanningStores / totalNRetailerStores * 100, 0);
		document.getElementById('nLost').innerHTML = nStoresWithLostSales.toString();
		document.getElementById('lostPerc').innerHTML = Math.round(nStoresWithLostSales / totalNRetailerStores * 100, 0);
		document.getElementById('lostAmount').innerHTML = totalLostSales.toLocaleString(undefined, {maximumFractionDigits:0});


		// Compute the cumulatuve lost sales percentage.
		var total = _.sum(lostValues);
		var totalReal = _.sum(lostValuesRealPos);
		var cum = [];
		var cumReal = [];
		lostValues.reduce(function(a,b,i) { return cum[i] = a+b; },0);
		lostValuesReal.reduce(function(a,b,i) { return cumReal[i] = a+b; },0);
		lostSalesCum = [];
		lostSalesPerc = [];
		lostStoresPerc = [];
		lostSalesEfficiency = [];
		for (var i = 0; i < cum.length; i++) {
			lostSalesPerc.push(cumReal[i] / totalReal);
			lostStoresPerc.push(_.clamp((i + 1) / nStoresWithLostSales, 0, 1));
			lostSalesEfficiency.push(lostSalesPerc[i] / lostStoresPerc[i]);
			lostSalesCum.push(cumReal[i]);
		}

		// Compute dimensions.
		var margin = {top: 20, right: 20, bottom: 40, left: 70};
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
			.orient('bottom')
		var yAxis = d3.svg.axis()
			.scale(y)
			.ticks(5)
			.tickFormat(function (d) {return '$' + d.toLocaleString()})
			.orient('left');


		// Main chart area.
		var svg = d3.select('#chart2').append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		var inner = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


		// Axis labels
		svg.append('g')
				.attr('class', 'x axis')
				// .attr('transform', 'translate(0,' + height + ')')
				.attr('transform', 'translate(0,' + (y(0)) + ')')
				.call(xAxis)
			.append('text')
				.attr('class', 'label')
				.attr('x', width/2)
				.attr('y', 40)
				.style('text-anchor', 'middle')
				.text('Store Rank')
		svg.append('g')
				.attr('class', 'y axis')
				.call(yAxis)
			.append('text')
				.attr('class', 'label')
				.attr('transform', 'rotate(-90)')
				.attr('y', -70)
				.attr('x', -height / 2)
				.attr('dy', '.71em')
				.style('text-anchor', 'middle')
				.text('Lost Sales Per Store')

		var line = d3.svg.line()
			.interpolate('basis')
			.x(function(d, i) {return x(i);})
			.y(function(d, i) {return y(d);})

		lostArea = d3.svg.area()
			.x(function(d, i) {return x(i);})
			.y1(function(d, i) {return y(d);})
			.y0(y(0))


		svg.append('path')
			.attr('class', 'area')
			.attr('d', lostArea(values.slice(0, 1000)));

		svg.append('path')
			.attr('class', 'line')
			.attr('d', line(values));




	}


	function _updateColours(updatedBy) {

		// Get the value, and set the other sliders
		var e = document.getElementById('slider2');
		var rawValue = parseFloat(e.value);


		var scaledValue = 1 - rawValue;
		scaledValue  = Math.pow(scaledValue, 0.5);
		scaledValue = _.clamp(scaledValue, 0, 1);
		var index = scaledValue * (nStores - 1);
		index = Math.round(index);
		var lostSalesLimit = sortedLostSales[index];

		// Update counts.
		var bIndex = nStores - index;
		bIndex = _.clamp(bIndex, 1, nStores-1);
		document.getElementById('lostSalesEfficienct').innerHTML = _.round(lostSalesEfficiency[bIndex] * 100, 0) + '%';

		document.getElementById('lostSalesamount').innerHTML = '$' + _.round(lostSalesCum[bIndex], 0).toLocaleString();
		document.getElementById('lostSalesPerc').innerHTML = _.round(lostSalesPerc[bIndex] * 100, 0) + '%';

		var lostSalesStores = Math.min(bIndex, nStoresWithLostSales);
		document.getElementById('storesWithLostSales').innerHTML = lostSalesStores;
		document.getElementById('storesWithLostSalesPerc').innerHTML = _.round(lostSalesStores / nStoresWithLostSales * 100, 0) + '%';

		document.getElementById('storeCount').innerHTML = bIndex;
		document.getElementById('storePerc').innerHTML = _.round(bIndex / nStores * 100, 0) + '%';

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


	var e = document.getElementById('slider2');
	e.addEventListener('input', function () {updateColours('slider2')});

	document.getElementById('inc').addEventListener('change', loadData);


})();


