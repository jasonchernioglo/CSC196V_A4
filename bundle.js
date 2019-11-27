//Populate both of the coin selectors with all the different slugs
var symbols = ['BTC','ETH','XRP','BCH','USDT','LTC','EOS','BNB','BSV','XLM','TRX','ADA','XMR','LEO','HT','LINK','MIOTA','NEO','DASH','ATOM','XTZ','ETC','MKR','ONT','USDC','CRO','XEM','DOGE','BAT','ZEC','PAX','VET','HEDG','QTUM','DCR','ZRX','TUSD','HOT','BTG','ABBC','ZB','RVN','OMG','KCS','LUNA','VSYS','CENNZ','NANO','BTM','EKT','ALGO','SNX','REP','LSK','BTT','BCD','DAI','SC','IOST','DGB','ICX','THETA','HC','BTS','WAVES','SXP'];
for(var x = 0; x < symbols.length; x++){
  $('#coin1Selector')
         .append($("<option></option>")
                    .attr("value",symbols[x])
                    .text(symbols[x])); 
  $('#coin2Selector')
         .append($("<option></option>")
                    .attr("value",symbols[x])
                    .text(symbols[x])); 
}


//Define the D3 draw function
(function (d3) {
  'use strict';

  const colorLegend = (selection, props) => {
    const {
      colorScale,
      circleRadius,
      spacing,
      textOffset
    } = props;

    const groups = selection.selectAll('g')
      .data(colorScale.domain());
    const groupsEnter = groups
      .enter().append('g')
        .attr('class', 'tick');
    groupsEnter
      .merge(groups)
        .attr('transform', (d, i) =>
          `translate(0, ${i * spacing})`
        );
    groups.exit().remove();

    groupsEnter.append('circle')
      .merge(groups.select('circle'))
        .attr('r', circleRadius)
        .attr('fill', colorScale);

    groupsEnter.append('text')
      .merge(groups.select('text'))
        .text(d => d)
        .attr('dy', '0.32em')
        .attr('x', textOffset);
  };

  const svg = d3.select('svg');


  const width = +svg.attr('width');
  const height = +svg.attr('height');

  const render = data => {

    // data = data.filter(function(d) { return d.symbol  == "BTC" || d.symbol == "ETH";});
    data = data.filter(function(d) { return d.symbol  == "LINK";});

    //Filter the data
    // if($('#coin1Selector').val() != "DISPLAY_ALL" && $('#coin2Selector').val() != "DISPLAY_ALL"){
    //   data = data.filter(function(d) { return d.symbol  == $('#coin1Selector').val() || d.symbol == $('#coin2Selector').val();});
    // }


    const title = '';
    
    const xValue = d => d.date;
    const xAxisLabel = 'Date';
    
    //Select which COMPARISON TYPE to use
    const yValue = d => d.close;
    // const yValue = d => d[$('#comparisonSelect').val()];
    const yAxisLabel = 'Closing Price (USD)';
    // const yAxisLabel = $('#comparisonSelect option:selected').text();
    
    const colorValue = d => d.symbol;
    
    const margin = { top: 60, right: 160, bottom: 88, left: 105 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, xValue))
      .range([0, innerWidth])
      .nice();
    
    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, yValue))
      .range([innerHeight, 0])
      .nice();
    
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const xAxis = d3.axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickPadding(15);
    
    const yAxis = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickPadding(10);
    
    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll('.domain').remove();
    
    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', -60)
        .attr('x', -innerHeight / 2)
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);
    
    const xAxisG = g.append('g').call(xAxis)
      .attr('transform', `translate(0,${innerHeight})`);
    
    xAxisG.select('.domain').remove();
    
    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 80)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(xAxisLabel);
    
    const lineGenerator = d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(yValue(d)))
      .curve(d3.curveBasis);
    
    const lastYValue = d =>
      yValue(d.values[d.values.length - 1]);
    
    const nested = d3.nest()
      .key(colorValue)
      .entries(data)
      .sort((a, b) =>
        d3.descending(lastYValue(a), lastYValue(b))
      );
    
    // console.log(nested);
    
    colorScale.domain(nested.map(d => d.key));
    
    g.selectAll('.line-path').data(nested)
      .enter().append('path')
        .attr('class', 'line-path')
        .attr('d', d => lineGenerator(d.values))
        .attr('stroke', d => colorScale(d.key));
    
    g.append('text')
        .attr('class', 'title')
        .attr('y', -10)
        .text(title);
    
    svg.append('g')
      .attr('transform', `translate(870,75)`)
      .call(colorLegend, {
        colorScale,
        circleRadius: 7,
        spacing: 18,
        textOffset: 9
      });
  };






  //Load the data & render the chart

  //If hosting on a web server, use the local data file:
  //d3.csv('data.csv')
  //If opening with no server:
  d3.csv('https://raw.githubusercontent.com/EvWoN/196V.A3/master/data.csv')
    .then(data => {
      data.forEach(d => {
        //All the attributes must be added this way
        d.open = +d.open;
        d.high = +d.high;
        d.low = +d.low;
        d.close = +d.close;
        d.volume = +d.volume;
        d.marketcap = +d.marketcap;
        d.date = new Date(d.date);
      });


      //Create a listener for when the comparison selector is modified
      $( "#comparisonSelect" ).change(function() {
        //Clear the old chart and draw a new one
        d3.selectAll("svg > *").remove();
        render(data);
      });

      //Create a listener for the first selected coin
      $( "#coin1Selector" ).change(function() {
        //Clear the old chart and draw a new one
        d3.selectAll("svg > *").remove();
        render(data);
      });
      $( "#coin2Selector" ).change(function() {
        //Clear the old chart and draw a new one
        d3.selectAll("svg > *").remove();
        render(data);
      });

      //Draw the chart
      render(data);
    });

}(d3));