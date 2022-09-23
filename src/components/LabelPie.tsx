import React, { Component } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';

interface LabelPieProps {
  data: Array<{ name: string; value: number }>;
  color: string;
}

interface LabelPieState {
  activeIndex: number;
}
// eslint-disable-next-line react/prefer-stateless-function
class LabelPie extends Component<LabelPieProps, LabelPieState> {
  constructor(props: LabelPieProps) {
    super(props);
    this.state = {
      activeIndex: 0,
    };

    this.onPieEnter = this.onPieEnter.bind(this);
  }

  onPieEnter = (_: any, index: number) => {
    this.setState({
      activeIndex: index,
    });
  };

  static renderActiveShape(props: any) {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <text x={cx} y={cy + 30} textAnchor="middle" fill="#333">{`${
          +(value * 100).toFixed(2) / 100
        }`}</text>
        <text x={cx} y={cy + 35} dy={18} textAnchor="middle" fill="#999">
          {`(${(percent * 100).toFixed(2)}% of Total)`}
        </text>
      </g>
    );
  }

  render() {
    const { activeIndex } = this.state;
    const { data, color } = this.props;

    return (
      <div style={{ width: '100%', height: 600 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={LabelPie.renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              fill={color}
              dataKey="value"
              onMouseEnter={this.onPieEnter}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default LabelPie;
