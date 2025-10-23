document.addEventListener('DOMContentLoaded', () => {
    // --- FIREBASE SETUP ---
    const firebaseConfig = {
        // Your Firebase project configuration
        apiKey: "AIzaSyD4NJ2LB6ZTkxqC6mLpBAOfhMdRamraXPY",
        authDomain: "go-upx.firebaseapp.com",
        projectId: "go-upx",
        storageBucket: "go-upx.firebasestorage.app",
        messagingSenderId: "1005492650531",
        appId: "1:1005492650531:web:3084d0e98a6818d03b2796",
        measurementId: "G-XTLTNL7B44"
    };

    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore(); // Initialize Firestore

    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            // Passa o usuário autenticado para a inicialização do app
            // para que possamos usar o ID dele para salvar os dados.
            initializeApp(user); // initializeApp is now async
        }
    });

    const ALL_ACTIVITIES = [
        { id: 'walk', title: 'Caminhada', icon: 'directions_walk', unit: 'km', baseCoins: 15, cooldown: 1 * 60 * 60 * 1000, requiresLocation: true, speedRange: [3, 7], goals: [1, 3, 5, 10], co2SavingPerKm: 120 }, // g/km
        { id: 'run', title: 'Corrida', icon: 'directions_run', unit: 'km', baseCoins: 20, cooldown: 2 * 60 * 60 * 1000, requiresLocation: true, speedRange: [7, 15], goals: [3, 5, 10, 21], co2SavingPerKm: 120 },
        { id: 'groupRun', title: 'Corrida em Grupo', icon: 'groups', unit: 'km', baseCoins: 22, cooldown: 2 * 60 * 60 * 1000, requiresLocation: true, speedRange: [7, 15], goals: [5, 10], co2SavingPerKm: 120 },
        { id: 'hike', title: 'Trilha', icon: 'hiking', unit: 'km', baseCoins: 25, cooldown: 4 * 60 * 60 * 1000, requiresLocation: true, speedRange: [2, 6], goals: [5, 10, 15], co2SavingPerKm: 120 },
        { id: 'bike', title: 'Pedalada', icon: 'pedal_bike', unit: 'km', baseCoins: 10, cooldown: 2 * 60 * 60 * 1000, requiresLocation: true, speedRange: [10, 30], goals: [10, 20, 50, 100], co2SavingPerKm: 120 },
        
        { id: 'skate', title: 'Skate', icon: 'skateboarding', unit: 'km', baseCoins: 12, cooldown: 1 * 60 * 60 * 1000, requiresLocation: true, speedRange: [5, 20], goals: [2, 5, 10], co2SavingPerKm: 120 },
        { id: 'rollerblade', title: 'Patins', icon: 'roller_skating', unit: 'km', baseCoins: 12, cooldown: 1 * 60 * 60 * 1000, requiresLocation: true, speedRange: [5, 20], goals: [2, 5, 10], co2SavingPerKm: 120 },
        { id: 'electricScooter', title: 'Patinete Elétrico', icon: 'electric_scooter', unit: 'km', baseCoins: 8, cooldown: 1 * 60 * 60 * 1000, requiresLocation: false, simulationRange: [3, 10], co2SavingPerKm: 100 },
        
    ];

    const ALL_COUPONS = [
        { id: 'restaurante20', title: '20% OFF em Restaurantes', description: 'Válido em restaurantes parceiros.', cost: 200 },
        { id: 'supermercado10', title: '10% OFF em Supermercados', description: 'Para suas compras do dia a dia.', cost: 150 },
        { id: 'livraria25', title: '25% OFF em Livrarias', description: 'Incentive a leitura.', cost: 300 },
        { id: 'vestuario15', title: '15% OFF em Vestuário', description: 'Renove seu guarda-roupa de forma consciente.', cost: 400 },
        { id: 'transporte5', title: '5% OFF em Transporte', description: 'Use em apps de transporte parceiros.', cost: 100 },
        { id: 'beleza10', title: '10% OFF em Cosméticos', description: 'Cuide-se com produtos sustentáveis.', cost: 250 },
        { id: 'cinema30', title: '30% OFF no Cinema', description: 'Para aquele filme que você quer ver.', cost: 350 },
        { id: 'academia15', title: '15% OFF na Academia', description: 'Mantenha a saúde em dia.', cost: 500 },
        { id: 'petshop10', title: '10% OFF em Pet Shops', description: 'Mimos para o seu melhor amigo.', cost: 180 },
        { id: 'cafe15', title: '15% OFF em Cafeterias', description: 'Aquela pausa para o café.', cost: 120 },
        { id: 'eletronicos5', title: '5% OFF em Eletrônicos', description: 'Desconto em eletrônicos selecionados.', cost: 1000 },
        { id: 'cursos20', title: '20% OFF em Cursos Online', description: 'Invista no seu conhecimento.', cost: 700 }
    ];

    const ALL_ACHIEVEMENTS = [
        { id: 'firstStep', title: 'Eco-Iniciante', condition: state => state.activitiesLogged >= 1, icon: 'footprint' },
        { id: 'shopper', title: 'Comprador Consciente', condition: state => state.couponsRedeemedCount >= 1, icon: 'shopping_bag' },
        { id: 'explorer', title: 'Explorador Físico', condition: state => Object.keys(state.activityStats).length >= 10, icon: 'explore' },
        { id: 'specialist', title: 'Atleta Ecológico', condition: state => Object.keys(state.activityStats).length >= 20, icon: 'military_tech' },
        { id: 'master', title: 'Mestre das Ruas', condition: state => Object.keys(state.activityStats).length >= ALL_ACTIVITIES.length, icon: 'emoji_events' },
        { id: 'level5', title: 'Nível 5', condition: state => state.level >= 5, icon: 'workspace_premium' },
        { id: 'level10', title: 'Nível 10', condition: state => state.level >= 10, icon: 'workspace_premium' },
        { id: 'streak3', title: 'Consistente', condition: state => state.consecutiveDays >= 3, icon: 'event_repeat' },
        { id: 'bikeMaster', title: 'Mestre da Bicicleta', condition: state => (state.activityStats.bike || 0) >= 500, icon: 'pedal_bike' },
        { id: 'marathoner', title: 'Maratonista Supremo', condition: state => (state.activityStats.run || 0) >= 200, icon: 'directions_run' },
    ];

    // --- DOM Elements ---
    const getEl = id => document.getElementById(id);
    const body = document.body, co2SavedElement = getEl('co2-saved');
    const themeToggle = getEl('theme-toggle'), logoutBtn = getEl('logout-btn'), coinBalanceElement = getEl('coin-balance'), progressRing = getEl('progress-ring'), userLevelElement = getEl('user-level'), nextLevelGoalElement = getEl('next-level-goal'), activityGrid = getEl('activity-grid'), couponGrid = getEl('coupon-grid'), achievementsGrid = getEl('achievements-grid'), feedList = getEl('feed-list'), toast = getEl('toast-notification'), toastText = getEl('toast-text');
    const rewardsModal = getEl('rewards-modal'), openRewardsModalBtn = getEl('open-rewards-modal'), closeRewardsModalBtn = getEl('close-rewards-modal');
    // Tracking Modal Elements
    const trackingModal = getEl('tracking-modal'), trackingActivityTitle = getEl('tracking-activity-title'), trackingDistance = getEl('tracking-distance'), trackingTime = getEl('tracking-time'), trackingSpeed = getEl('tracking-speed'), trackingStatus = getEl('tracking-status'), stopTrackingBtn = getEl('stop-tracking-btn'), distanceLabel = getEl('distance-label');
    // Goal Modal Elements
    const goalSelectionModal = getEl('goal-selection-modal'), goalActivityTitle = getEl('goal-activity-title'), closeGoalModalBtn = getEl('close-goal-modal'), goalGrid = getEl('goal-grid');


    // --- STATE MANAGEMENT ---
    let appState, userUID; // userUID will be set by initializeApp

    const defaultState = {
        coins: 0, level: 1, activitiesLogged: 0, couponsRedeemedCount: 0,
        consecutiveDays: 0, lastActivityTimestamp: 0,
        totalCo2Saved: 0, // in grams
        redeemedCouponIds: [], unlockedAchievementIds: [], 
        lastActivityLog: {},
        activityStats: {}
    };

    async function loadState() { // Make loadState asynchronous
        if (!userUID) { // Should not happen if called from initializeApp
            appState = { ...defaultState };
            return;
        }
        try {
            const docRef = db.collection('users').doc(userUID);
            const doc = await docRef.get();
            if (doc.exists) {
                // Merge saved data with default to ensure new fields are present
                appState = { ...defaultState, ...doc.data() };
            } else {
                appState = { ...defaultState }; // New user or no data yet
                // For a new user, immediately save the default state to Firestore
                await saveState();
            }
        } catch (error) {
            console.error("Error loading state from Firestore:", error);
            appState = { ...defaultState }; // Fallback to default state on error
        }

        // Garante que lastActivityLog seja inicializado se não existir, mas não o reseta se já estiver salvo.
        if (!appState.lastActivityLog) appState.lastActivityLog = {};
        if (!appState.activityStats) appState.activityStats = {};
        if (!appState.redeemedCouponIds) appState.redeemedCouponIds = [];
        if (!appState.unlockedAchievementIds) appState.unlockedAchievementIds = [];
    }

    async function saveState() { // Make saveState asynchronous
        if (!userUID) {
            console.warn("Cannot save state: user not authenticated.");
            return;
        }
        try {
            const docRef = db.collection('users').doc(userUID);
            await docRef.set(appState); // Overwrite with current appState
        } catch (error) {
            console.error("Error saving state to Firestore:", error);
        }
    }

   
    function renderAll() {
        renderActivities();
        renderCoupons();
        renderAchievements();
        updateDashboard();
        updateActivityButtons();
        updateCouponButtons();
    }

    function renderActivities() {
        activityGrid.innerHTML = '';
        ALL_ACTIVITIES.forEach(activity => {
            const btn = document.createElement('button');
            btn.className = 'button activity-btn';
            btn.dataset.activity = activity.id;
            btn.dataset.state = 'ready';
            btn.innerHTML = `<span class="material-symbols-outlined">${activity.icon}</span><span>${activity.title}</span>`;
            activityGrid.appendChild(btn);
        });
    }

    function renderCoupons() {
        couponGrid.innerHTML = '';
        ALL_COUPONS.forEach(coupon => {
            const card = document.createElement('div');
            card.className = 'coupon-card'; // Add a specific class for styling
            card.innerHTML = `<h3>${coupon.title}</h3><p>${coupon.description}</p><div class="coupon-cost"><span class="material-symbols-outlined coin-icon">monetization_on</span><span>${coupon.cost}</span></div><button class="button redeem-btn" data-id="${coupon.id}" disabled>Esgotado</button>`;
            couponGrid.appendChild(card);
        });
        updateCouponButtons();
    }

    function updateCouponButtons() {
        couponGrid.querySelectorAll('.redeem-btn').forEach(btn => {
            // Força todos os cupons a aparecerem como esgotados.
            btn.disabled = true;
            btn.textContent = 'Esgotado';
        });
    }

    function renderAchievements() {
        achievementsGrid.innerHTML = '';
        ALL_ACHIEVEMENTS.forEach(ach => {
            const isUnlocked = appState.unlockedAchievementIds.includes(ach.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
            card.innerHTML = `<span class="material-symbols-outlined icon">${ach.icon}</span><h4>${ach.title}</h4>`;
            achievementsGrid.appendChild(card);
        });
    }

    function updateDashboard() {
        appState.level = Math.floor(Math.log2(appState.coins / 100 + 1)) + 1;
        const goalForNextLevel = Math.floor(Math.pow(2, appState.level) * 100);
        const previousLevelGoal = Math.floor(Math.pow(2, appState.level - 1) * 100);
        const coinsInLevel = appState.coins - previousLevelGoal;
        const goalForLevel = goalForNextLevel - previousLevelGoal;
        const progressPercent = goalForLevel > 0 ? Math.max(0, Math.min(1, coinsInLevel / goalForLevel)) : 0;
        const offset = (2 * Math.PI * progressRing.r.baseVal.value) * (1 - progressPercent);
        progressRing.style.strokeDashoffset = offset;
        coinBalanceElement.textContent = appState.coins;
        userLevelElement.textContent = appState.level;
        nextLevelGoalElement.textContent = goalForNextLevel;

        // Update impact stats
        co2SavedElement.textContent = (appState.totalCo2Saved / 1000).toFixed(2); // Convert grams to kg
    }

    function addFeedItem(icon, text) {
        const item = document.createElement('li');
        item.className = 'feed-item';
        item.innerHTML = `<span class="material-symbols-outlined icon">${icon}</span><p>${text}</p>`;
        feedList.prepend(item);
        if (feedList.children.length > 15) feedList.lastChild.remove();
    }

    function showToast(achievement) {
        toastText.textContent = `Você desbloqueou: "${achievement.title}"!`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

    function checkAchievements() {
        ALL_ACHIEVEMENTS.forEach(ach => {
            if (!appState.unlockedAchievementIds.includes(ach.id) && ach.condition(appState)) {
                appState.unlockedAchievementIds.push(ach.id);
                showToast(ach);
                addFeedItem('workspace_premium', `Conquista: ${ach.title}`);
                renderAchievements();
            }
        });
    }

    function redeemCoupon(e) {
        const couponId = e.target.dataset.id;
        const coupon = ALL_COUPONS.find(c => c.id === couponId);
        if (appState.coins >= coupon.cost) {
            appState.coins -= coupon.cost;
            appState.couponsRedeemedCount++;
            addFeedItem('shopping_bag', `Você resgatou "${coupon.title}"`);
            checkAchievements();
            updateDashboard();
            updateCouponButtons();
            saveState();
        } else { alert('Moedas insuficientes!'); }
    }

    function updateStreak() {
        const now = new Date();
        const last = new Date(appState.lastActivityTimestamp);
        const oneDay = 24 * 60 * 60 * 1000;
        if (appState.lastActivityTimestamp === 0 || (now - last) > (2 * oneDay)) {
            appState.consecutiveDays = 1;
        } else if ((now - last) > oneDay && now.getDate() !== last.getDate()) {
            appState.consecutiveDays++;
        }
        appState.lastActivityTimestamp = now.getTime();
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function updateActivityButtons() {
        const now = Date.now();
        activityGrid.querySelectorAll('.activity-btn').forEach(btn => {
            if (btn.classList.contains('in-progress')) return;

            const activityId = btn.dataset.activity;
            const activity = ALL_ACTIVITIES.find(a => a.id === activityId);
            if (!activity) return;

            const lastLog = appState.lastActivityLog[activityId] || 0;
            const timeRemaining = (lastLog + activity.cooldown) - now;

            if (timeRemaining > 0) {
                btn.disabled = true;
                if (btn.dataset.state !== 'cooldown') {
                    btn.dataset.state = 'cooldown';
                    btn.innerHTML = `<span class="material-symbols-outlined">timer</span> <span class="time">${formatTime(timeRemaining)}</span>`;
                } else {
                    const timeEl = btn.querySelector('.time');
                    if (timeEl) timeEl.textContent = formatTime(timeRemaining);
                }
            } else {
                if (btn.dataset.state !== 'ready') {
                    btn.dataset.state = 'ready';
                    btn.disabled = false;
                    btn.innerHTML = `<span class="material-symbols-outlined">${activity.icon}</span><span>${activity.title}</span>`;
                    // Exibe a distância acumulada para atividades que rastreiam distância
                    if (activity.unit === 'km' && appState.activityStats[activityId] > 0) {
                        const totalKm = appState.activityStats[activityId].toFixed(1);
                        btn.innerHTML += `<span class="activity-total-stat">Total: ${totalKm} ${activity.unit}</span>`;
                    }
                }
            }
        });
    }

    // --- GEOLOCATION TRACKING ---
    let trackingState = {
        watchId: null,
        activity: null,
        goal: null, // in km
        startTime: null,
        lastPosition: null,
        totalDistance: 0, // in meters
        timeUpdater: null,
        validPoints: 0,
        invalidPoints: 0,
        // --- Step Counter State ---
        stepCount: 0,
        lastAcceleration: null,
        stepThreshold: 1.5, // Adjust this based on testing
        lastStepTime: 0,
    };

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        // eslint-disable-next-line no-unused-vars
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // in metres
    }

    // --- DEVICE MOTION (PEDOMETER) ---
    function handleMotion(event) {
        const now = Date.now();
        // Debounce steps to avoid false positives
        if (now - trackingState.lastStepTime < 250) return;

        const { x, y, z } = event.accelerationIncludingGravity;
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        if (trackingState.lastAcceleration !== null) {
            const delta = Math.abs(magnitude - trackingState.lastAcceleration);
            if (delta > trackingState.stepThreshold) {
                trackingState.stepCount++;
                trackingState.lastStepTime = now;
                // Optional: update UI with step count
            }
        }
        trackingState.lastAcceleration = magnitude;
    }

    function openGoalSelection(activity) {
        if (!navigator.geolocation) {
            alert('Seu navegador não suporta geolocalização.');
            return;
        }

        const now = Date.now();
        const lastLog = appState.lastActivityLog[activity.id] || 0;
        if ((now - lastLog) < activity.cooldown) {
            alert(`Você precisa esperar ${formatTime(activity.cooldown - (now - lastLog))} para fazer esta atividade novamente.`);
            return;
        }

        goalActivityTitle.textContent = `Meta para ${activity.title}`;
        goalGrid.innerHTML = '';

        // Add goal buttons
        activity.goals.forEach(goal => {
            const btn = document.createElement('button');
            btn.className = 'button goal-btn';
            btn.dataset.goal = goal;
            btn.innerHTML = `<span class="goal-distance">${goal}</span><span class="goal-unit">${activity.unit}</span>`;
            goalGrid.appendChild(btn);
        });

        // Add "Free Mode" button
        const freeBtn = document.createElement('button');
        freeBtn.className = 'button goal-btn';
        freeBtn.dataset.goal = '0'; // 0 for free mode
        freeBtn.innerHTML = `<span class="material-symbols-outlined goal-distance">all_inclusive</span><span>Modo Livre</span>`;
        goalGrid.appendChild(freeBtn);

        goalSelectionModal.style.display = 'flex';
        // clearInterval(trackingState.uiUpdater); // Pause button updates
        body.classList.add('modal-open');
        goalGrid.onclick = (e) => {
            const goalBtn = e.target.closest('.goal-btn');
            if (goalBtn) {
                const goal = parseFloat(goalBtn.dataset.goal);
                
                // Request permission for motion sensors (crucial for iOS 13+)
                if (typeof DeviceMotionEvent.requestPermission === 'function') {
                    DeviceMotionEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                goalSelectionModal.style.display = 'none';
                                startActivityTracking(activity, goal);
                            } else {
                                alert('Permissão para sensores de movimento negada. A contagem de passos não funcionará.');
                                goalSelectionModal.style.display = 'none';
                                startActivityTracking(activity, goal); // Start anyway, but without step counting
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao solicitar permissão de movimento:', error);
                            alert('Ocorreu um erro ao solicitar permissão para os sensores de movimento.');
                        });
                } else {
                    // For browsers that don't require explicit permission (Android, Desktop)
                    goalSelectionModal.style.display = 'none';
                    startActivityTracking(activity, goal);
                }
            }
        };
    }

    function startActivityTracking(activity, goal) {
        // Reset state
        trackingState = { ...trackingState, activity, goal, startTime: Date.now(), lastPosition: null, totalDistance: 0, validPoints: 0, invalidPoints: 0, stepCount: 0, lastAcceleration: null, lastStepTime: 0 };

        const options = { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 };

        trackingState.watchId = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, options);

        // Start listening to motion events for step counting
        window.addEventListener('devicemotion', handleMotion);


        // Show tracking modal
        trackingActivityTitle.textContent = `Rastreando: ${activity.title}`;
        body.classList.add('modal-open');
        trackingModal.style.display = 'flex';

        // Start UI timer
        trackingState.timeUpdater = setInterval(updateTrackingUI, 1000);
    }

    function stopActivityTracking() {
        if (trackingState.watchId) {
            navigator.geolocation.clearWatch(trackingState.watchId);
        }
        if (trackingState.timeUpdater) {
            clearInterval(trackingState.timeUpdater);
        }
        // Stop listening to motion events
        window.removeEventListener('devicemotion', handleMotion);

        // Hide modal
        trackingModal.style.display = 'none';
        body.classList.remove('modal-open');

        // Validate and complete activity
        const { activity, goal, totalDistance, validPoints, invalidPoints, stepCount } = trackingState;
        const distanceKm = totalDistance / 1000;

        // --- ENHANCED VALIDATION ---
        // Estimate expected steps: average 1250 steps per km.
        const expectedSteps = distanceKm * 1250;
        // If steps were counted, check if they are reasonable (e.g., at least 20% of expected)
        const isStepCountValid = stepCount > 0 ? stepCount > (expectedSteps * 0.2) : true; // If no steps counted, assume valid for now

        console.log(`Distância: ${distanceKm.toFixed(2)}km, Passos Contados: ${stepCount}, Passos Esperados: ~${Math.floor(expectedSteps)}`);

        // Validation: at least 50m, more valid points, and reasonable step count for walking/running activities
        if (distanceKm > 0.05 && validPoints > invalidPoints) {
            let coinsEarned = Math.floor(distanceKm * activity.baseCoins);
            let feedMessage = `+${coinsEarned} moedas por ${distanceKm.toFixed(2)} ${activity.unit} de ${activity.title}.`;

            // Check for goal completion bonus
            if (goal > 0 && distanceKm >= goal) {
                const bonusCoins = Math.floor(goal * activity.baseCoins * 0.2); // 20% bonus
                coinsEarned += bonusCoins;
                feedMessage = `Meta de ${goal}km atingida! +${coinsEarned} moedas (incluindo ${bonusCoins} de bônus).`;
            }

            if (!isStepCountValid && (activity.id === 'walk' || activity.id === 'run' || activity.id === 'hike')) {
                 addFeedItem('warning', `Atividade "${activity.title}" suspeita. A distância não corresponde ao movimento detectado.`);
                 return; // Cancel reward
            }

            // Calculate and add CO2 savings
            if (activity.co2SavingPerKm) {
                appState.totalCo2Saved += distanceKm * activity.co2SavingPerKm;
            }

            appState.activitiesLogged++;
            appState.lastActivityLog[activity.id] = Date.now();
            if (!appState.activityStats[activity.id]) {
                appState.activityStats[activity.id] = 0;
            }
            appState.activityStats[activity.id] += distanceKm;

            updateStreak();
            appState.coins += coinsEarned;
            addFeedItem(activity.icon, feedMessage);
            checkAchievements();
            saveState();
            updateDashboard();
            updateCouponButtons();
            updateActivityButtons();
        } else {
            addFeedItem('warning', `Atividade "${activity.title}" cancelada por inconsistência ou curta distância.`);
        }

        // Reset state
        trackingState = { watchId: null, activity: null, goal: null, startTime: null, lastPosition: null, totalDistance: 0, timeUpdater: null, validPoints: 0, invalidPoints: 0, stepCount: 0, lastAcceleration: null, lastStepTime: 0 };
    }

    function handlePositionUpdate(position) {
        const { latitude, longitude, speed } = position.coords;
        const now = Date.now();

        let calculatedSpeed = speed ? speed * 3.6 : 0; // API speed is in m/s, convert to km/h

        if (trackingState.lastPosition) {
            const distance = calculateDistance(trackingState.lastPosition.latitude, trackingState.lastPosition.longitude, latitude, longitude);
            const timeElapsed = (now - trackingState.lastPosition.timestamp) / 1000; // seconds

            if (timeElapsed > 0) {
                const speedFromCalc = (distance / timeElapsed) * 3.6; // km/h
                // Prefer calculated speed if it's significant, as device `speed` can be null
                if (speedFromCalc > 0.5) calculatedSpeed = speedFromCalc;
            }
            trackingState.totalDistance += distance;
        }

        // Speed validation
        const [minSpeed, maxSpeed] = trackingState.activity.speedRange;
        if (calculatedSpeed >= minSpeed && calculatedSpeed <= maxSpeed) {
            trackingStatus.textContent = 'Velocidade compatível. Continue assim!';
            trackingStatus.style.color = 'var(--success-color)';
            trackingState.validPoints++;
        } else if (calculatedSpeed > maxSpeed) {
            trackingStatus.textContent = 'Velocidade muito alta para esta atividade. Reduza o ritmo.';
            trackingStatus.style.color = '#e74c3c';
            trackingState.invalidPoints++;
        } else {
            trackingStatus.textContent = 'Mova-se para validar a atividade.';
            trackingStatus.style.color = 'var(--text-color)';
        }

        trackingState.lastPosition = { latitude, longitude, timestamp: now };
        updateTrackingUI(calculatedSpeed);
    }

    function handlePositionError(error) {
        console.error('Erro de geolocalização:', error);
        let errorMessage = 'Não foi possível obter sua localização.';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Permissão de localização negada. Habilite nas configurações do seu navegador para continuar.';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Sinal de GPS indisponível. Tente em uma área mais aberta.';
                break;
            case error.TIMEOUT:
                errorMessage = 'Tempo esgotado para obter sinal. Verifique sua conexão e tente em um local com céu aberto.';
                break;
        }
        trackingStatus.textContent = errorMessage;
        trackingStatus.style.color = '#e74c3c';
    }

    function updateTrackingUI(currentSpeed = 0) {
        const timeElapsed = Date.now() - trackingState.startTime;
        const distanceKm = trackingState.totalDistance / 1000;
        trackingTime.textContent = formatTime(timeElapsed);
        if (trackingState.goal > 0) {
            distanceLabel.textContent = 'Progresso da Meta';
            trackingDistance.textContent = `${distanceKm.toFixed(2)} / ${trackingState.goal} km`;
        } else {
            distanceLabel.textContent = 'Distância';
            trackingDistance.textContent = `${distanceKm.toFixed(2)} km`;
        }
        trackingSpeed.textContent = `${currentSpeed.toFixed(1)} km/h`;
    }


    function runSimulation(activityId) {
        const activity = ALL_ACTIVITIES.find(a => a.id === activityId);
        if (!activity) return;

        const now = Date.now();
        const lastLog = appState.lastActivityLog[activityId] || 0;

        if ((now - lastLog) < activity.cooldown) {
            alert(`Você precisa esperar ${formatTime(activity.cooldown - (now - lastLog))} para fazer esta atividade novamente.`);
            return;
        }

        const clickedBtn = activityGrid.querySelector(`.activity-btn[data-activity="${activityId}"]`);

        clickedBtn.classList.add('in-progress');
        clickedBtn.disabled = true;
        clickedBtn.innerHTML = `<span class="material-symbols-outlined">hourglass_top</span><span>Em andamento...</span>`;

        const simulationTime = Math.random() * 2000 + 1000;
        
        setTimeout(() => {
            // Use a simulation range if defined, otherwise use a default range.
            const range = activity.simulationRange || [1, 5];
            const [min, max] = range;
            // Generate a random value within the range. For km, it can be a float.
            const value = parseFloat((Math.random() * (max - min) + min).toFixed(2));

            const coinsEarned = value * activity.baseCoins;

            // Calculate and add CO2 savings
            if (activity.co2SavingPerKm) {
                appState.totalCo2Saved += value * activity.co2SavingPerKm;
            }

            appState.coins += coinsEarned;
            appState.activitiesLogged++;
            appState.lastActivityLog[activityId] = Date.now();
            if (!appState.activityStats[activityId]) {
                appState.activityStats[activityId] = 0;
            }
            appState.activityStats[activityId] += value;

            updateStreak();
            addFeedItem(activity.icon, `+${Math.floor(coinsEarned)} moedas por ${value} ${activity.unit} de ${activity.title}.`);
            checkAchievements();
            saveState();
            updateDashboard();
            updateCouponButtons();

            clickedBtn.classList.remove('in-progress');
            updateActivityButtons();

        }, simulationTime);
    }

    function toggleModal(show) {
        rewardsModal.style.display = show ? 'flex' : 'none';
        body.classList.toggle('modal-open', show);
        if (show) updateCouponButtons();
    }

    async function initializeApp(user) { // Make initializeApp asynchronous
        userUID = user.uid; // Armazena o ID único do usuário

        // Define a função setTheme primeiro para que ela possa ser usada em qualquer lugar dentro de initializeApp.
        const setTheme = (theme) => {
            body.classList.toggle('dark-theme', theme === 'dark');
            themeToggle.innerHTML = `<span class="material-symbols-outlined">${theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>`;
            localStorage.setItem('ecoTrocaTheme', theme);
        };

        await loadState(); // Await loading state from Firestore
        renderAll();
        setTheme(localStorage.getItem('ecoTrocaTheme') || 'light');
        progressRing.style.strokeDasharray = `${2 * Math.PI * progressRing.r.baseVal.value} ${2 * Math.PI * progressRing.r.baseVal.value}`;
        
        activityGrid.addEventListener('click', (e) => {
            const clickedBtn = e.target.closest('.activity-btn');
            if (clickedBtn && !clickedBtn.disabled) {
                const activityId = clickedBtn.dataset.activity;
                const activity = ALL_ACTIVITIES.find(a => a.id === activityId);
                toggleModal(false); // Close coupon modal if open
                
                if (activity.requiresLocation) {
                    openGoalSelection(activity);
                } else {
                    runSimulation(activityId);
                }
            }
        });

        openRewardsModalBtn.addEventListener('click', () => toggleModal(true));
        closeRewardsModalBtn.addEventListener('click', () => toggleModal(false));
        couponGrid.addEventListener('click', (e) => { if (e.target.classList.contains('redeem-btn')) redeemCoupon(e); });
        rewardsModal.addEventListener('click', (e) => {
            if (e.target === rewardsModal) toggleModal(false);
        });

        const closeGoalModal = () => {
            goalSelectionModal.style.display = 'none';
            // trackingState.uiUpdater = setInterval(updateActivityButtons, 1000); // Resume updates
            body.classList.remove('modal-open');
        };

        closeGoalModalBtn.addEventListener('click', closeGoalModal);
        goalSelectionModal.addEventListener('click', (e) => {
            if (e.target === goalSelectionModal) closeGoalModal();
        });

        stopTrackingBtn.addEventListener('click', stopActivityTracking);

        themeToggle.addEventListener('click', () => {
            const isDarkMode = body.classList.contains('dark-theme');
            const newTheme = isDarkMode ? 'light' : 'dark';
            setTheme(newTheme);
        });
        
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            });
        });
        setInterval(updateActivityButtons, 1000);
    }
});