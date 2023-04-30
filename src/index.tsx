import React, {
  useRef,
  useState,
  useEffect
} from 'react';

export interface Props {
  radius: number;
  strokeWidth: number;
  values: Array<number>;
  colors: Array<string>;
}

const DonutChart = ({ radius, values, colors, strokeWidth }: Props) => {
  
  const boxWidth = radius * 2;
  const positionRef = useRef({ x: 0, y: 0 });
  const [highlight, setHighlight] = useState(-1);
  const circumference = 2 * Math.PI * (radius - strokeWidth);
  const total = values.reduce((acc, current) => current + acc);
  let angleOffset = -90;

  const mapValues = (value: number) => {
    const rotate = angleOffset;
    const dataPercentage = value / total;
    const strokeDashOffset = circumference - dataPercentage * circumference;
    angleOffset = 360.0 * dataPercentage + angleOffset;
    return {
      rotate,
      strokeDashOffset
    };
  };

  const sortedValues = values.sort((a, b) => b - a);

  const circles = sortedValues.map(mapValues);

  const center = { x: positionRef.current.x + radius, y: positionRef.current.y + radius };

  const onMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const distanceBetweenPoints = Math.sqrt((event.pageX - center.x) ** 2 + (event.pageY - center.y) ** 2);
    if (distanceBetweenPoints <= radius - strokeWidth / 2.0 && distanceBetweenPoints >= radius - strokeWidth * 1.5) {
      const angle = Math.atan(
        (event.pageY - center.y) / (event.pageX - center.x)
      ) * 180 / Math.PI + (event.pageX >= center.x ? 90 : 270);
      const percentage = angle / 360.0;
      let sum = 0.0;
      for (let i = 0; i < circles.length; i++) {
        sum += (circumference - circles[i].strokeDashOffset);
        if (sum > circumference * percentage) {
          if (highlight !== i) {
            setHighlight(i);
          }
          break;
        }
      }
    } else {
      setHighlight(-1);
    }
  };

  const resizeEvent = () => {
    setHighlight((previousValue) => previousValue - 1);
  };

  useEffect(() => {
    resizeEvent(); // force a rerender when component is mounted to make sure that center is correct
    window.addEventListener('resize', resizeEvent);
    return () => {
      window.removeEventListener('resize', resizeEvent);
    }
  }, []);

  return (
    <svg
      ref={el => {
        if (!el) return;
        const { x, y } = el.getBoundingClientRect();
        positionRef.current.x = x;
        positionRef.current.y = y;
      }}
      onMouseMove={onMouseMove}
      height={boxWidth} width={boxWidth} viewBox={`0 0 ${boxWidth} ${boxWidth}`}>
      <g>
        {circles.map((c, index) => (
          <circle
            key={`C_${index}`}
            transform={`rotate(${c.rotate} ${radius} ${radius})`}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth}
            fill="transparent"
            stroke={colors[index]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={c.strokeDashOffset}
            style={highlight >= 0 ? {opacity: highlight === index ? 1 : 0.5} : {}}
          />
        ))}
      </g>
    </svg>
  );
};

export default DonutChart;