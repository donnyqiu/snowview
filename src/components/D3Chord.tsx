import * as React from 'react';
import * as d3 from 'd3';
import { ChordGroup, ChordSubgroup, Chord, color, rgb } from 'd3';
import { Chords } from 'd3-chord';

interface D3GraphProps {
  id: string;
  data: number[][];
  colors: string[];
  labels: string[];
}

function mix(color1: string, color2: string) {
  const c1 = color(color1);
  const c2 = color(color2);
  const newColor = rgb(
    (c1.rgb().r + c2.rgb().r) / 2,
    (c1.rgb().g + c2.rgb().g) / 2,
    (c1.rgb().b + c2.rgb().b) / 2
  );
  return newColor.toString();
}

class D3Chord extends React.Component<D3GraphProps, {}> {

  canvas: d3.Selection<SVGGElement, Chords, HTMLElement, {}>;

  ribbons: d3.Selection<SVGGElement, Chord, SVGGElement, {}>;

  update = () => {
    const outerRadius = 30, innerRadius = outerRadius - 2;

    const {data, colors, labels} = this.props;

    const chord = d3.chord()
        .padAngle(0.1)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const arc = d3.arc<ChordGroup>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon<Chord, ChordSubgroup>()
      .radius(innerRadius);

    const svg = d3.select<SVGSVGElement, {}>(`#${this.props.id}`);

    const width = 150;
    const height = 100;

    const binaryData: number[][] = [];
    for (let i = 0; i < data.length; i++) {
      binaryData.push([]);
      for (let j = 0; j < data[i].length; j++) {
        binaryData[i].push(Math.log(data[i][j] + 1));
      }
    }

    this.canvas = svg
      .append<SVGGElement>('g')
      .attr('transform', `translate(${width / 3}, ${height / 2})`)
      .datum(chord(binaryData))
      .on('onMouseLeave', this.onMouseLeave);

    this.ribbons = this.canvas.append<SVGGElement>('g')
      .attr('class', 'ribbons')
      .selectAll('path')
      .data(chords => chords)
      .enter()
      .append<SVGGElement>('g');

    const group = this.canvas.append<SVGGElement>('g')
      .attr('class', 'groups')
      .selectAll('g')
      .data<ChordGroup>(chords => chords.groups)
      .enter().append<SVGGElement>('g');

    group.append('path')
      .attr('id', d => `p${d.index}`)
      .style('fill', d => colors[d.index])
      .attr('d', arc)
      .on('mouseenter', this.onMouseOver)
      .on('mouseleave', this.onMouseLeave);

    group.append('title')
      .html(d => labels[d.index]);

    this.ribbons
      .append('path')
      .attr('d', ribbon)
      .style('fill', d => mix(colors[d.source.index], colors[d.target.index]))
      .style('stroke-width', '0.1')
      .style('stroke', 'black')
      .on('mouseenter', this.MouseOver)
      .on('mouseleave', this.onMouseLeave);
    this.ribbons
      .append('title')
      .html(d =>  `${labels[d.source.index].substr(0, labels[d.source.index].indexOf('('))} → ${labels[d.target.index].substr(0, labels[d.target.index].indexOf('('))} ${data[d.source.index][d.target.index]}`);

    group.append('svg:text')
      .style('font-size', '2px')
      .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
      .attr('dy', '0.35em')
      .attr('transform', d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 0.1})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `)
      .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
      .attr('text-anchor', d => (d.startAngle + d.endAngle) / 2 > Math.PI ? 'end' : null)
      .text(function (d: ChordGroup) {
        return labels[d.index].substr(0, labels[d.index].indexOf('('));
      });

  }

  MouseOver = (d: { source: { index: number; }; target: { index: number; }; }) => {
    this.ribbons.classed('fade', p => {
      return !(p.source.index === d.source.index && p.target.index === d.target.index);
    });
  }

  onMouseOver = (d: {}, i: {}) => {
    this.ribbons.classed('fade', p => {
      return p.source.index !== i && p.target.index !== i;
    });
  }

  onMouseLeave = () => {
    this.ribbons.classed('fade', false);
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  render() {
    return (
      <div style={{width: '100%'}}>
        <svg
          width="100%"
          height={600}
          viewBox="0,0,100,100"
          id={this.props.id}
        />
      </div>
    );
  }
}

export default D3Chord;