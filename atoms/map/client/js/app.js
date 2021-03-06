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

const proindependednce = [
{code:'0010',name:'ERC'},
{code:'0546',name:'FNC'},
{code:'1083',name:'JxCat'},
{code:'1097',name:'PDeCAT'},
{code:'1098',name:'CUP-G'},
{code:'1101',name:'MPIC'},
{code:'1102',name:'PNC'}
]

let capitals = [
{name:'Barcelona', coordinates:[2.1733676,41.4038413]},
{name:'Girona', coordinates:[2.8192063,41.978854]},
{name:'Lleida', coordinates:[0.6189664,41.6175089]},
{name:'Tarragona', coordinates:[1.2422923,41.118617]}
]

let svg = d3.select('.gv-map-container').append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'gv-geo-map')

let municipalitiesMap = svg.append('g')
let provincesMap = svg.append('g')
let municipalitieStroke = svg.append('g')
let capitalsMap = svg.append('g')

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
.attr('stroke-width', '1.5px')
.attr('fill', 'none')

let colors = ['#FEF7E6', '#FBE4A8', '#F8D16A', '#F5BE2C'];

let colorScale = d3.scaleThreshold()
.range(colors);

colors.map(d => {

	d3.select('.gv-key-bar')
	.append('div')
	.attr('class', 'gv-key-color-box')
	.style('background', d)
})

for (var i = 0; i < colors.length + 1; i++) {

	d3.select('.gv-key-footer')
	.append('div')
	.attr('id', 'gv-key-text-' + i)
	.attr('class', 'gv-key-text-box')
	.html(i)
}


//let winners = [];

let indies = [];



fileRaw.map(d => {

		let results = d.results.sort((a,b) => b.votes - a.votes);

		let independentists = results.filter(d => proindependednce.find(i => i.code === d.party_code));

		if(independentists.length > 0){

			let sum = d3.sum(independentists, d => d.percentage);

			indies.push({
				code:d.code,
				independence_percentage:sum
			})

			/*municipalitiesMap.select('.m' + d.code)
			.classed('independence', true)*/



		}


		/*if(results.length > 0)
		{
			let winner = results[0];

			municipalitiesMap.select('.m' + d.code)
			.classed('p' + winner.party_code, true)

			winners[d.code] = {party:winner.party_name,votes:winner.votes,percentage:winner.percentage}
		}*/
		
})

let max = d3.max(indies, d => +d.independence_percentage);
console.log(max)

colorScale.domain([max/4,max/3,max/2,max])

let divider = 0;

	for (var i = 1; i <= 5; i++) {

		let divider = 5 - i;

		d3.select('#gv-key-text-' + i)
		.html(Math.round(+max / divider))
	}

indies.map(d => {
	municipalitiesMap.select('.m' + d.code)
	.attr('fill', colorScale(+d.independence_percentage))
	//.attr('opacity', d.independence_percentage / max)
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

	let text = '-';
	let match = indies.find(d => d.code === value);
	console.log(match)

	if(match) text = match.independence_percentage.toFixed(1) + '%';

	d3.select('.gv-winner-counter-header')
	.html('Pro-independence share')

	d3.select('.gv-winner-counter-value')
	.html(text)


	/*if(winners[value])
	{
		d3.select('.gv-winner-counter-header')
		.html(winners[value].party)

		d3.select('.gv-winner-counter-value')
		.html(winners[value].votes + ' votes ('+ +winners[value].percentage.toFixed(1) +'%)')

	}
	else
	{
		d3.select('.gv-winner-counter-header')
		.html('')

		d3.select('.gv-winner-counter-value')
		.html('')
	}*/

	
}


capitalsMap
.selectAll('circle')
.data(capitals)
.enter()
.append('circle')
.attr('class', 'gv-city-circle')
.attr('r', 2.5)
.attr('cx', d => projection(d.coordinates)[0])
.attr('cy', d => projection(d.coordinates)[1])

capitalsMap
.selectAll('text')
.data(capitals)
.enter()
.append('text')
.attr('class', 'gv-city-text')
.attr('transform', d => `translate(${projection(d.coordinates)[0] + 5},${projection(d.coordinates)[1]})`)
.text(d => d.name)

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
    let posY = top + 20;

    if(posX + tWidth > width) posX = width - tWidth;
    if(posX < 0) posX = 0;
    if(posY + tHeight > height) posY = top - tHeight;
    if(posY < 0) posY = 0;


    d3.select('.gv-tooltip-container').style('left',  posX + 'px')
    d3.select('.gv-tooltip-container').style('top', posY + 'px')

}



if(window.resize)window.resize()
