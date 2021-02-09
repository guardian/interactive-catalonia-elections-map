import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import map from 'assets/catalonia.json'
import fileRaw from 'assets/results.json'

const d3 = Object.assign({}, d3B, d3Select);

const isMobile = window.matchMedia('(max-width: 700px)').matches;

const atomEl = d3.select('.gv-catalonia-map-wrapper').node();

const width = atomEl.getBoundingClientRect().width;
const height =  width;

let projection = d3.geoMercator()

let path = d3.geoPath()
.projection(projection)

projection.fitSize([width, height], topojson.feature(map, map.objects.catalonia_municipalities_2062));

let svg = d3.select('.gv-catalonia-map-wrapper').append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'gv-geo-map')

let municipalitiesMap = svg.append('g')
let provincesMap = svg.append('g')
let municipalitieStroke = svg.append('g')

municipalitiesMap
.selectAll('path')
.data(topojson.feature(map, map.objects.catalonia_municipalities_2062).features)
.enter()
.append('path')	
.attr('d', path)
.attr('class', d => d.properties.NAMEUNIT + ' m' + d.properties.NATCODE )
.attr('fill', '#dadada')
.attr('stroke', '#ffffff')
.attr('stroke-width', .5)
.on('mouseover', (event,d) => {
		highlight(d.properties.NATCODE)
		manageOver(d.properties.NAMEUNIT, d.properties.NATCODE)
	})
.on('mouseout', event => resetHighlight())
.on('mousemove', event => manageMove(event));

provincesMap
.selectAll('path')
.data(topojson.feature(map, map.objects.catalonia_line_provinces_2062).features)
.enter()
.append('path')	
.attr('d', path)
.attr('stroke', '#FFFFFF')
.attr('fill', 'none')


let winners = [];

fileRaw.map(d => {

		let results = d.results.sort((a,b) => b.votes - a.votes);

		if(results.length > 0)
		{
			let winner = results[0];

			municipalitiesMap.select('.m' + d.code)
			.classed('p' + winner.party_code, true)

			winners[d.code] = {party:winner.party_name,votes:winner.votes,percentage:winner.percentage}
		}
		
})

municipalitieStroke
.selectAll('path')
.data(topojson.feature(map, map.objects.catalonia_municipalities_2062).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'stroke s-' + d.properties.NATCODE )
.attr('fill','none')
.attr('stroke-width','1.5px')
.attr('pointer-events', 'none')
.attr('stroke-linecap', 'round')

const manageOver = (name, value) => {

	d3.select('.gv-tooltip-header-container')
	.html(name);

	if(winners[value])
	{
		d3.select('.gv-winner-counter-header')
		.html(winners[value].party)

		d3.select('.gv-winner-counter-value')
		.html(winners[value].votes + ' votes ('+ winners[value].percentage +'%)')

	}
	else
	{
		d3.select('.gv-winner-counter-header')
		.html('')

		d3.select('.gv-winner-counter-value')
		.html('')
	}

	
}

const highlight = (value) => {

	d3.select('.gv-tooltip-container')
	.classed('over', true)

	d3.select('.s-' + value)
	.style('stroke', '#333333')

}

const resetHighlight = () => {

	d3.select('.gv-tooltip-container')
	.classed('over', false)

	d3.selectAll('.stroke')
	.style('stroke', 'none')
}

const manageMove = (event) => {
	
    let left = event.clientX + -atomEl.getBoundingClientRect().left;
    let top = event.clientY + -atomEl.getBoundingClientRect().top;


    let tWidth = d3.select('.gv-tooltip-container').node().getBoundingClientRect().width;
    let tHeight = d3.select('.gv-tooltip-container').node().getBoundingClientRect().height;

    let posX = left - tWidth /2;
    let posY = top + tHeight;

    if(posX + tWidth > width) posX = width - tWidth;
    if(posX < 0) posX = 0;
    if(posY + tHeight > height) posY = top;
    if(posY < 0) posY = 0;

    d3.select('.gv-tooltip-container').style('left',  posX + 'px')
    d3.select('.gv-tooltip-container').style('top', posY + 'px')

}


