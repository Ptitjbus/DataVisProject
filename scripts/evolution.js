var dom = document.getElementById('evolutionContainer');
var myChart = echarts.init(dom, null, {
    renderer: 'svg',
    useDirtyRect: false
});
var app = {};

var option;

option = {
    backgroundColor: '#00000000',
    lineY: {
        color: '#FFFFFF'
    },
    title: {
        text: '',
        subtext: ''
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#FF4B47',
            },
        }
    },
    toolbox: {
        show: true,
        feature: {
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [
            '1957',
            '1970',
            '1980',
            '1993',
            '2001',
            '2005',
            '2013',
            '2016',
            '2020',
            '2022'
        ],
        axisLabel: {
            color: '#FFFFFF',
            fontFamily: 'Noto Sans,sans-serif',
            fontSize: 14
        },
        axisLine: {
            lineStyle: {
                color: '#FFFFFF'
            }
        }
    },
    yAxis: {
        type: 'value',
        color: '#FFFFFF',
        axisLabel: {
            color: '#FFFFFF',
            fontFamily: 'Noto Sans,sans-serif',
            fontSize: 14
        },
        axisPointer: {
            snap: true
        }
    },
    visualMap: {
        show: false,
        dimension: 0,
        pieces: [
            {
                lte: 6,
                color: '#FF4B47'
            },
            {
                gt: 6,
                lte: 8,
                color: '#FF4B47'
            },
            {
                gt: 8,
                lte: 14,
                color: '#FF4B47'
            },
            {
                gt: 14,
                lte: 17,
                color: '#FF4B47'
            },
            {
                gt: 17,
                color: '#FF4B47'
            }
        ]
    },
    series: [
        {
            name: 'Débris',
            type: 'line',
            smooth: true,
            data: [1, 2850, 6000, 7700, 8700, 10300, 16600, 17700, 21000, 31870],
            areaStyle: {
                color: '#F3133B40'
            },
            lineStyle: {
                width: 2
            }
        }
    ]
};


if (option && typeof option === 'object') {
    myChart.setOption(option);
}

window.addEventListener('resize', myChart.resize);