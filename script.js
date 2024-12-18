class TreasureMap {
  static async loadGameData() {
    try {
      const response = await fetch('http://localhost:3000/game_data.txt'); // 修改为指向后端服务器
      if (!response.ok) {
        throw new Error(`Failed to load game data. Status: ${response.status}`);
      }
      const data = await response.text();
      const lines = data.split('\n');
      const result = {};
      for (const line of lines) {
        const [key, value] = line.split(': ');
        result[key] = value;
      }
      return result;
    } catch (error) {
      console.error('Error loading game data:', error);
      return {};
    }
  }
  static async loadGameDataLocal() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function() {
        const data = reader.result;
        const lines = data.split('\n');
        const result = {};
        for (const line of lines) {
          const [key, value] = line.split(': ');
          result[key] = value;
        }
        resolve(result);
      };
      reader.onerror = function(error) {
        reject(error);
      };
      const fileInput = document.getElementById('fileInput');
      reader.readAsText(fileInput.files[0]);
    });
  } 
  //添加一些代码来监听文件输入元素的change事件
  static async loadGameDataFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function() {
        const data = reader.result;
        const lines = data.split('\n');
        const result = {};
        for (const line of lines) {
          const [key, value] = line.split(': ');
          result[key] = value;
        }
        resolve(result);
      };
      reader.onerror = function(error) {
        reject(error);
      };
      reader.readAsText(file);
    });
  }
  static async getInitialClue() {
    const gameData = await this.loadGameData();
    document.getElementById('clueBox').textContent = gameData.library;
    const LIBRARY_IMAGE_PATH = 'image/library.png';
    document.getElementById('clueImage').src = LIBRARY_IMAGE_PATH;
    return gameData.library;
  }

  static async decodeAncientScript(clue) {
    const DECODE_IMAGE_PATH = 'image/decode.jpg';
    document.getElementById('decodeImage').src = DECODE_IMAGE_PATH;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("解码成功! " + clue);
      }, 1500);
    });
  }

  static async searchTemple(location) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const random = Math.random();
        if (random < 0.5) {
          reject(new Error("糟糕!遇到了神庙守卫!"));
        }
        const TEMPLE_IMAGE_PATH = 'image/Temple.jpg';
        document.getElementById('templeImage').src = TEMPLE_IMAGE_PATH;
        resolve("找到了一个神秘的箱子...");
      }, 2000);
    });
  }

  static async openTreasureBox() {
    const TREASURE_IMAGE_PATH = 'image/Treasure.jpg';
    document.getElementById('treasureImage').src = TREASURE_IMAGE_PATH;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("恭喜!你找到了传说中的宝藏!");
      }, 1000);
    });
  }
}
// 新增函数来处理文件输入
async function handleFileInput() {
  const fileInput = document.getElementById('fileInput');
  if (fileInput.files.length > 0) {
    try {
      const gameData = await TreasureMap.loadGameDataFromFile(fileInput.files[0]);
      // 在这里可以处理加载的游戏数据
      console.log('Game data loaded from file:', gameData);
    } catch (error) {
      console.error('Error loading game data from file:', error);
    }
  }
}
// 监听文件输入元素的 change 事件
document.getElementById('fileInput').addEventListener('change', handleFileInput);
// 新增函数来处理背景音乐的播放
function playBackgroundMusic() {
  const bgMusic = document.getElementById('bg-music');
  if (bgMusic) {
    bgMusic.play();
  }
}
async function loadElements() {
  try {
    const response = await fetch('./game_data.txt');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    const lines = data.split('\n');
    const elementInfo = {};
    for (const line of lines) {
      const [key, value] = line.split(': ');
      elementInfo[key] = value;
    }
    // 在页面上显示元素信息
    const elementInfoDiv = document.getElementById('elementInfo');
    for (const key in elementInfo) {
      const p = document.createElement('p');
      p.textContent = `${key}: ${elementInfo[key]}`;
      elementInfoDiv.appendChild(p);
    }
  } catch (error) {
    console.error('Error loading elements:', error);
  }
}

async function findTreasureWithPromises() {
  try {
    let clue = await TreasureMap.getInitialClue();
    document.getElementById('clueBox').textContent = clue;

    let location = await TreasureMap.decodeAncientScript(clue);
    document.getElementById('decodeBox').textContent = location;

    let boxResult = await TreasureMap.searchTemple(location);
    document.getElementById('templeBox').textContent = boxResult;

    let treasure = await TreasureMap.openTreasureBox();
    document.getElementById('treasureBox').textContent = treasure;

    // Save game history
    const gameHistory = localStorage.getItem('gameHistory') || '[]';
    const history = JSON.parse(gameHistory);
    const now = new Date();
    history.push({
      clue,
      location,
      boxResult,
      treasure,
      timestamp: now.toISOString()
    });
    localStorage.setItem('gameHistory', JSON.stringify(history));
  } catch (error) {
    document.getElementById('treasureBox').textContent = "任务失败: " + error;
  }
}

window.onload = async function() {
  // 在游戏开始时调用背景音乐播放函数
  playBackgroundMusic();
  // 存储
  localStorage.setItem('playerId', '12345');
  localStorage.setItem('playerNickname', '冒险者');
  // Restore player info from localStorage
  const playerId = localStorage.getItem('playerId');
  const playerNickname = localStorage.getItem('playerNickname');
  // 将玩家信息显示在页面上
  document.getElementById('playerId').textContent = playerId;
  document.getElementById('playerNickname').textContent = playerNickname;

  // Play background music on page load
  const bgMusic = document.getElementById('bg-music');
  bgMusic.play();

  const gameHistory = localStorage.getItem('gameHistory') || '[]';
  const history = JSON.parse(gameHistory);
  const historyElement = document.getElementById('history');
  historyElement.innerHTML = history.map(item => `<p>${JSON.stringify(item.timestamp)} - ${JSON.stringify(item)}
</p>`).join('');

  // 直接使用loadGameData获取数据并显示元素信息
  try {
    const elementInfo = await TreasureMap.loadGameData();
    const elementInfoDiv = document.getElementById('elementInfo');
    for (const key in elementInfo) {
      const p = document.createElement('p');
      p.textContent = `${key}: ${elementInfo[key]}`;
      elementInfoDiv.appendChild(p);
    }
  } catch (error) {
    console.error('Error loading elements:', error);
  }
};
// 新增函数来停止背景音乐的播放
function stopBackgroundMusic() {
  const bgMusic = document.getElementById('bg-music');
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
}

// 在游戏结束时调用停止背景音乐播放函数
findTreasureWithPromises().then(() => {
  stopBackgroundMusic();
}).catch(() => {
  stopBackgroundMusic();
});
// Save player info to localStorage
function savePlayerInfo() {
  const playerId = document.getElementById('playerId').textContent;
  const playerNickname = document.getElementById('playerNickname').textContent;
  localStorage.setItem('playerId', playerId);
  localStorage.setItem('playerNickname', playerNickname);
}

// Call savePlayerInfo when player info is modified
if (playerId) {
  document.getElementById('playerId').textContent = playerId;
  savePlayerInfo();
}
if (playerNickname) {
  document.getElementById('playerNickname').textContent = playerNickname;
  savePlayerInfo();
}

findTreasureWithPromises();