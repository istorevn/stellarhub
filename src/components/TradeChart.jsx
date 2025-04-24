import { useEffect, useRef } from "react";
import {
    createChart,
    CandlestickSeries,
    HistogramSeries,
} from "lightweight-charts";

export default function TradeChart({ data, onLoadMore }) {
    const chartRef = useRef();
    const chartInstanceRef = useRef();
    const candleSeriesRef = useRef();
    const volumeSeriesRef = useRef();

    useEffect(() => {
        const chart = createChart(chartRef.current, {
            width: chartRef.current.clientWidth,
            height: 300,
            layout: {
                background: { color: "#fff" },
                textColor: "#000",
            },
            grid: {
                vertLines: { color: "#eee" },
                horzLines: { color: "#eee" },
            },
            timeScale: {
                borderColor: "#ccc",
            },
            rightPriceScale: {
                borderColor: "#ccc",
            },
        });

        chartInstanceRef.current = chart;

        candleSeriesRef.current =  chart.addSeries(CandlestickSeries,{
            priceScaleId: "right",
            upColor: "#26a69a",
            downColor: "#ef5350",
            borderVisible: false,
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350",
        });

        volumeSeriesRef.current = chart.addSeries(HistogramSeries,{
            priceScaleId: "volume",
            priceFormat: { type: "volume" },
            color: "#d1d4dc",
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        const handleResize = () => {
            chart.applyOptions({ width: chartRef.current.clientWidth });
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        // 🔁 Auto load more when scroll left
        chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
            const logicalFrom = range?.from;
            const firstDataTime = data?.[0]?.time;

            if (logicalFrom !== undefined && firstDataTime !== undefined && logicalFrom <= firstDataTime + 1) {
                onLoadMore?.(firstDataTime);
            }
        });

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, []);

    // ⏫ Update chart data when changed
    useEffect(() => {
        if (!data.length) return;

        const candles = data.map(({ time, open, high, low, close }) => ({
            time, open, high, low, close,
        }));

        const volumes = data.map(({ time, volume, open, close }) => ({
            time,
            value: volume,
            color: close > open ? "#26a69a" : "#ef5350",
        }));

        candleSeriesRef.current.setData(candles);
        volumeSeriesRef.current.setData(volumes);
    }, [data]);

    return <div ref={chartRef} className="w-full" />;
}
