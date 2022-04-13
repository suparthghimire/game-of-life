const start_game = document.querySelector("#start_game");
const pause_game = document.querySelector("#pause_game");
const reset_game = document.querySelector("#reset_game");
const colorIp = document.querySelector("#color");
let color = "#DC143C";
colorIp.addEventListener("input", () => {
  color = colorIp.value;
  setColor(color);
});

const setColor = (value) => {
  color = value;
};
const getColor = () => {
  return color;
};

const range = document.querySelector("#range_resolution");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const dim = 800;
let resolution = 70;
const cell_dim = dim / resolution;
canvas.height = dim;
canvas.width = dim;
ctx.lineWidth = 0.1;

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

const render_board = (resolution, board) => {
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const x = i * cell_dim;
      const y = j * cell_dim;

      ctx.strokeRect(x, y, cell_dim, cell_dim);
      if (board[i * resolution + j] === 1) {
        ctx.fillStyle = getColor();
        ctx.fillRect(x, y, cell_dim, cell_dim);
      }
      // ctx.font = "15px Arial";
      // ctx.fillText(`${i}, ${j}`, x + cell_dim / 2 - 15, y + cell_dim / 2 + 7.5);
    }
  }
};

const make_board = (resolution) => {
  const arr = [];
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      arr.push(0);
    }
  }
  return arr;
};

const update_board = (board, index) => {
  const i = Math.floor(index / resolution);
  const j = index % resolution;
  const x = i * cell_dim;
  const y = j * cell_dim;
  if (board[index] == 1) {
    ctx.fillStyle = getColor();
    ctx.fillRect(x, y, cell_dim, cell_dim);
  } else if (board[index] == 0) {
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, cell_dim, cell_dim);
  }
  ctx.strokeRect(x, y, cell_dim, cell_dim);
  // ctx.font = "15px Arial";
  // ctx.fillStyle = "black";
  // ctx.fillText(`${i}, ${j}`, x + cell_dim / 2 - 15, y + cell_dim / 2 + 7.5);
};

const check_all_fill = (board) => {
  const len = board.filter((cell) => cell === null).length;
  return len === 0;
};

const check_null = (obj) => {
  return Object.keys(obj).some((key) => obj[key] === null);
};
const remove_null = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
};

const get_nbr_index = (cellidx) => {
  const i = Math.floor(cellidx / resolution);
  const j = cellidx % resolution;
  const inc_i = i + 1;
  const dec_i = i - 1;
  const inc_j = j + 1;
  const dec_j = j - 1;

  let top = { i: null, j: null };
  let bottom = { i: null, j: null };
  let left = { i: null, j };
  let right = { i: null, j };

  let topLeft = { i: null, j: null };
  let topRight = { i: null, j: null };
  let bottomLeft = { i: null, j: null };
  let bottomRight = { i: null, j: null };

  const left_condition = dec_i >= 0;
  const right_condition = inc_i < resolution;
  const top_condition = dec_j >= 0;
  const bottom_condition = inc_j < resolution;

  if (bottom_condition) bottom = { i, j: inc_j };

  if (top_condition) top = { i, j: dec_j };

  if (right_condition) right = { i: inc_i, j };

  if (left_condition) left = { i: dec_i, j };

  if (left_condition && top_condition) topLeft = { i: dec_i, j: dec_j };

  if (right_condition && top_condition) topRight = { i: inc_i, j: dec_j };

  if (left_condition && bottom_condition) bottomLeft = { i: dec_i, j: inc_j };

  if (right_condition && bottom_condition) bottomRight = { i: inc_i, j: inc_j };

  return remove_null({
    top: check_null(top) ? null : top,
    left: check_null(left) ? null : left,
    right: check_null(right) ? null : right,
    bottom: check_null(bottom) ? null : bottom,
    topLeft: check_null(topLeft) ? null : topLeft,
    topRight: check_null(topRight) ? null : topRight,
    bottomLeft: check_null(bottomLeft) ? null : bottomLeft,
    bottomRight: check_null(bottomRight) ? null : bottomRight,
  });
};

const play_game = (resolution, board) => {
  let interval = setInterval(() => {
    let newBoard = make_board(resolution);
    for (let col = 0; col < resolution; col++) {
      for (let row = 0; row < resolution; row++) {
        const idx = col * resolution + row;
        let neighbours = get_nbr_index(idx);
        let total_alive_nbrs = 0;
        Object.entries(neighbours).forEach(([dir, val]) => {
          const nbr_1d_idx = val.i * resolution + val.j;
          if (board[nbr_1d_idx] === 1) {
            total_alive_nbrs++;
          }
        });
        if (board[idx] === 0 && total_alive_nbrs === 3) newBoard[idx] = 1;
        else if (
          board[idx] === 1 &&
          (total_alive_nbrs < 2 || total_alive_nbrs > 3)
        )
          newBoard[idx] = 0;
        else newBoard[idx] = board[idx];
        update_board(newBoard, idx);
      }
    }
    board = newBoard;
    pause_game.addEventListener("click", () => {
      clearInterval(interval);
      start_game.disabled = false;
      pause_game.disabled = true;
    });
  }, 0);
};

function main() {
  let board = make_board(resolution);
  board = set_board(board);
  render_board(resolution, board);
  canvas.addEventListener("click", (e) => {
    const ex = e.clientX - canvas.getBoundingClientRect().x;
    const ey = e.clientY - canvas.getBoundingClientRect().y;
    let i = Math.floor(ex / cell_dim);
    let j = Math.floor(ey / cell_dim);
    const idx = i * resolution + j;
    console.log(idx);
    if (board[idx] == 1) {
      board[idx] = 0;
    } else {
      board[idx] = 1;
    }
    update_board(board, idx);
  });

  start_game.addEventListener("click", () => {
    play_game(resolution, board);
    // start_game.disabled = true;
    start_game.innerText = "Resume Game";
    pause_game.disabled = false;
  });
}
main();

function set_board(board) {
  const data = [
    776, 777, 778, 779, 780, 781, 782, 783, 784, 785, 786, 787, 788, 789, 790,
    791, 792, 793, 794, 795, 796, 797, 798, 799, 801, 800, 802, 803, 805, 804,
    806, 807, 808, 809, 810, 812, 813, 811, 815, 814, 816, 818, 817, 820, 819,
    821, 822, 823, 824, 825, 826, 827, 828, 829, 831, 830, 832, 833, 834, 835,
    847, 917, 918, 1058, 988, 1059, 1129, 1200, 1130, 1271, 1341, 1411, 1482,
    1552, 1553, 1623, 1763, 1764, 1693, 1834, 1905, 1975, 2046, 2117, 2187,
    2258, 2328, 2540, 2329, 2399, 2471, 2402, 2332, 2333, 2193, 2263, 2264,
    2194, 2125, 1986, 2055, 1917, 1848, 1779, 1709, 1640, 1570, 1502, 1501,
    1433, 1294, 1363, 1295, 1225, 1226, 1296, 1436, 1366, 1507, 1577, 1647,
    1648, 1718, 1788, 1859, 1929, 2000, 2070, 2141, 2211, 2282, 2352, 2423,
    2493, 2564, 2634, 2704, 2775, 2916, 2846, 2987, 3057, 3128, 3269, 3199,
    3130, 3061, 2922, 2783, 2644, 2852, 2713, 2575, 2435, 2505, 2366, 2296,
    2227, 2087, 2157, 2018, 3200, 1949, 1879, 1810, 1740, 1671, 1670, 1601,
    1600, 1531, 1461, 1391, 1321, 1322, 1252, 1182, 1113, 1043, 973, 904, 836,
    837, 838, 920, 991, 1062, 848, 919, 849, 850, 852, 851, 921, 922, 923, 989,
    1060, 1131, 1201, 1272, 1342, 1412, 1483, 1554, 1624, 1694, 1765, 1835,
    1836, 1906, 1976, 1977, 2047, 2118, 2188, 2259, 2330, 2400, 2470, 2401,
    2331, 2262, 2123, 2124, 2054, 1985, 1916, 1847, 1777, 1708, 1778, 1638,
    1639, 1499, 1569, 1500, 1431, 1362, 1432, 1293, 1224, 1297, 1367, 1437,
    1508, 1578, 1649, 1789, 1719, 1860, 1930, 2001, 2071, 2142, 2212, 2283,
    2353, 2494, 2425, 2354, 2424, 2565, 2635, 2705, 2776, 2706, 2847, 2917,
    2918, 2988, 3058, 3059, 2991, 3129, 3060, 2990, 2921, 2851, 2920, 2781,
    2782, 2712, 2642, 2643, 2573, 2574, 2504, 2434, 2364, 2365, 2295, 2226,
    2156, 2086, 2017, 1947, 1948, 1878, 1809, 1739, 1669, 1599, 1529, 1530,
    1460, 1390, 1320, 1251, 1181, 1112, 1042, 972, 903, 902, 901, 970, 969, 924,
    925, 927, 926, 928, 929, 930, 931, 932, 933, 934, 935, 936, 937, 938, 939,
    940, 941, 942, 943, 944, 945, 946, 947, 948, 950, 949, 951, 952, 953, 954,
    955, 956, 958, 959, 957, 960, 961, 962, 964, 963, 965, 966, 967, 968, 971,
    900, 899, 898, 897, 896, 895, 894, 892, 893, 891, 890, 889, 887, 888, 853,
    854, 856, 990, 855, 857, 858, 859, 860, 861, 862, 863, 864, 865, 867, 868,
    866, 869, 870, 872, 873, 871, 875, 874, 876, 877, 878, 880, 881, 879, 882,
    884, 883, 885, 886, 1061, 1132, 1202, 1273, 1343, 1413, 1484, 1555, 1695,
    1625, 1766, 1837, 1907, 1767, 1838, 1908, 1978, 2048, 2049, 2119, 2189,
    2190, 2260, 2261, 2192, 2121, 1981, 1840, 1700, 1560, 1419, 1277, 1205,
    1064, 992, 1063, 1133, 1203, 1274, 1344, 1414, 1415, 1485, 1275, 1345, 1134,
    1204, 994, 995, 993, 1066, 1067, 996, 1065, 1135, 1136, 1206, 1276, 1346,
    1416, 1486, 1556, 1626, 1696, 1697, 1627, 1487, 1417, 1347, 1137, 1207, 997,
    1068, 998, 1138, 1278, 1348, 1208, 1418, 1558, 1488, 1557, 1628, 1698, 1768,
    1769, 1839, 1979, 1909, 1699, 1629, 1559, 1489, 1349, 1279, 1209, 1139,
    1069, 999, 1070, 1140, 1280, 1350, 1420, 1490, 1630, 1770, 1910, 1980, 2050,
    2120, 2191, 2122, 2051, 1983, 2052, 2053, 1984, 1041, 1040, 1109, 1037,
    1039, 1038, 1106, 1036, 1035, 1034, 1033, 1103, 1102, 1032, 1101, 1030,
    1031, 1029, 1028, 1027, 1026, 1025, 1024, 1023, 1022, 1021, 1020, 1019,
    1018, 1017, 1016, 1015, 1014, 1013, 1012, 1011, 1010, 1009, 1008, 1007,
    1006, 1005, 1004, 1003, 1002, 1001, 1000, 1210, 1141, 1211, 1281, 1351,
    1422, 1492, 1421, 1491, 1561, 1562, 1631, 1632, 1701, 1702, 1771, 1772,
    1841, 1842, 1911, 1912, 1982, 1913, 1914, 1915, 1845, 1844, 1843, 1846,
    1706, 1774, 1773, 1703, 1705, 1776, 1775, 1704, 1634, 1635, 1636, 1707,
    1563, 1565, 1494, 1633, 1564, 1637, 1567, 1568, 1498, 1430, 1359, 1429,
    1428, 1497, 1566, 1496, 1495, 1493, 1423, 1353, 1354, 1352, 1282, 1212,
    1142, 1144, 1072, 1071, 1073, 1143, 1214, 1284, 1213, 1283, 1424, 1425,
    1355, 1285, 1427, 1356, 1426, 1358, 1357, 1288, 1287, 1286, 1215, 1216,
    1074, 1145, 1075, 1146, 1076, 1147, 1217, 1077, 1148, 1218, 1078, 1150,
    1220, 1219, 1360, 1290, 1289, 1149, 1079, 1080, 1151, 1221, 1291, 1361,
    1081, 1152, 1222, 1153, 1292, 1082, 1083, 1223, 1227, 1298, 1368, 1438,
    1364, 1365, 1506, 1084, 1154, 1085, 1155, 1157, 1086, 1156, 1087, 1158,
    1228, 1299, 1301, 1444, 1447, 1730, 1940, 2291, 2709, 2849, 2708, 2779,
    2848, 2778, 2777, 2637, 2636, 2707, 2989, 2919, 2850, 2710, 2641, 2502,
    2293, 2154, 1943, 1803, 1662, 1524, 1387, 1249, 1389, 1111, 1250, 1090,
    1089, 1088, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099, 1100,
    1104, 1105, 1107, 1108, 1110, 1180, 1179, 1177, 1178, 1176, 1175, 1173,
    1172, 1171, 1170, 1169, 1167, 1166, 1168, 1165, 1164, 1163, 1162, 1161,
    1160, 1159, 1174, 1244, 1245, 1246, 1247, 1248, 1319, 1459, 1458, 1318,
    1388, 1317, 1316, 1315, 1314, 1243, 1313, 1242, 1312, 1241, 1311, 1310,
    1240, 1239, 1309, 1308, 1237, 1307, 1238, 1236, 1235, 1234, 1233, 1232,
    1230, 1229, 1440, 1370, 1376, 1375, 1305, 1304, 1306, 1303, 1231, 1300,
    1439, 1509, 1369, 1579, 1650, 1790, 1720, 1861, 1931, 1932, 2002, 2072,
    2144, 2213, 2143, 2284, 2355, 2495, 2566, 2567, 2568, 2638, 2639, 2640,
    2780, 2711, 2570, 2572, 2571, 2503, 2433, 2363, 2294, 2224, 2225, 2155,
    2015, 2085, 2016, 1946, 1807, 1877, 1808, 1738, 1598, 1668, 1528, 1527,
    1457, 1386, 1526, 1597, 1667, 1736, 1806, 1737, 1876, 1945, 1875, 1735,
    1805, 1666, 1596, 1665, 1595, 1456, 1455, 1525, 1384, 1454, 1664, 1804,
    1944, 2014, 2084, 2153, 2223, 2292, 2362, 2432, 2431, 2501, 2500, 2569,
    2499, 2498, 2497, 2496, 2426, 2427, 2428, 2429, 2430, 2360, 2359, 2358,
    2357, 2356, 2361, 2289, 2287, 2285, 2286, 2288, 2290, 2220, 2151, 2221,
    2222, 2152, 2082, 2013, 2083, 2012, 1942, 1872, 1873, 1874, 1734, 1733,
    1663, 1594, 1593, 1523, 1453, 1383, 1385, 1581, 1580, 1510, 1441, 1302,
    1371, 1372, 1373, 1374, 1513, 1442, 1443, 1512, 1511, 1651, 1721, 1791,
    1792, 1862, 1933, 2003, 2214, 2073, 2145, 2215, 2216, 2217, 2219, 2218,
    2149, 2148, 2147, 2146, 2150, 2080, 2081, 2011, 1870, 1941, 2010, 2079,
    2078, 2077, 2076, 2075, 2074, 2004, 1934, 1864, 1793, 1863, 1653, 1722,
    1652, 1582, 1583, 1723, 1794, 1865, 2005, 2006, 1935, 2007, 2008, 2009,
    1871, 1802, 1732, 1592, 1522, 1382, 1452, 1381, 1380, 1378, 1377, 1449,
    1448, 1379, 1450, 1521, 1451, 1591, 1731, 1801, 1661, 1660, 1520, 1590,
    1939, 1938, 1937, 1936, 1867, 1868, 1869, 1800, 1585, 1516, 1517, 1587,
    1658, 1797, 1866, 1795, 1654, 1584, 1445, 1515, 1724, 1796, 1798, 1799,
    1659, 1729, 1589, 1519, 1588, 1728, 1727, 1726, 1725, 1655, 1656, 1657,
    1586, 1518, 1446, 1514,
  ];
  data.forEach((item) => {
    board[item] = 1;
  });
  return board;
}
