let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute("value", data.color);
});

changeColor.onclick = function(element) {
  let color = element.target.value;
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.executeScript(tabs[0].id, {
      code: 'document.body.style.backgroundColor = "' + color + '";'
    });
  });
};

/**
 *
 * @param {Array<Object>} arr 数组
 * @param {String} idKey 节点id的属性名
 * @param {String} parentIdKey 节点连接的依据(当前节点的父节点id的属性名)
 */
function connectArrAsTree(arr, idKey, parentIdKey) {
  let tempMap = {};
  let res = { children: [] };
  for (let node of arr) {
    tempMap[node[idKey]] = node;
  }

  for (let node of arr) {
    if (!node[parentIdKey]) {
      res.children.push(node);
      continue;
    }
    if (!tempMap[node[parentIdKey]].children) {
      tempMap[node[parentIdKey]].children = [];
    }
    tempMap[node[parentIdKey]].children.push(node);
  }

  return res;
}

/**
 * @description 转换普通数组为echarts tree要求的格式
 * @param {Array<Object>} arr
 * @param {String} nameKey
 * @param {String} valueKey
 */
function transformToEchartsTreeArray(arr, nameKey, valueKey) {
  return arr.map(v => ({
    ...v,
    name: v[nameKey] || "",
    value: v[valueKey] || ""
  }));
}

chrome.tabs.query({}, function(tabs) {
  console.log(tabs);
  let data = connectArrAsTree(
    transformToEchartsTreeArray(tabs, "title", "url"),
    "id",
    "openerTabId"
  );
  var myChart = echarts.init(document.getElementById("canvas"));
  myChart.on("click", function(params) {
    // 控制台打印数据的名称
    console.log(params);
    chrome.tabs.highlight({
      tabs: params.data.index
    });
  });
  myChart.setOption(
    (option = {
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove"
      },
      series: [
        {
          type: "tree",

          data: [data],

          top: "1%",
          left: "7%",
          bottom: "1%",
          right: "20%",

          symbolSize: 7,

          label: {
            position: "left",
            verticalAlign: "middle",
            align: "right",
            fontSize: 9
          },

          leaves: {
            label: {
              position: "right",
              verticalAlign: "middle",
              align: "left"
            }
          },

          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750
        }
      ]
    })
  );
});
