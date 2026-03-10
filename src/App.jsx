import React, { useState, useEffect } from 'react';
import { solveOuroquest } from './core/ouroquest';
import { solveOurochest } from './core/ourochest';
import { generateOuroquestBoard, generateOurochestBoard } from './core/simulator';
import { translations } from './translations';
import { MousePointer2, RefreshCw, AlertCircle, Settings2, Globe, Gamepad2, Eye, EyeOff, XCircle } from 'lucide-react';

const COLORS = {
    hidden: { name: 'Hidden', hex: '#6b7280', value: 'hidden' },
    blue: { name: 'Blue (0)', hex: '#5b98f2', value: 0 },
    cyan: { name: 'Cyan (1)', hex: '#5be2f2', value: 1 },
    green: { name: 'Green (2)', hex: '#74c476', value: 2 },
    yellow: { name: 'Yellow (3)', hex: '#f4dc5c', value: 3 },
    orange: { name: 'Orange (4)', hex: '#f2a65b', value: 4 },
    purple: { name: 'Purple', hex: '#be7bdc', value: 'purple' },
    red: { name: 'Red', hex: '#f25b5b', value: 'red' }
};

const QUEST_COLORS = ['hidden', 'blue', 'cyan', 'green', 'yellow', 'orange', 'purple'];
const CHEST_COLORS = ['hidden', 'blue', 'cyan', 'green', 'yellow', 'orange', 'red'];

function App() {
    const [mode, setMode] = useState('quest'); // 'quest' | 'chest'
    const [isSimulator, setIsSimulator] = useState(false);
    const [showProbs, setShowProbs] = useState(true);
    const [language, setLanguage] = useState('en'); // 'en' | 'pt'
    const [board, setBoard] = useState(new Array(5).fill(null).map(() => new Array(5).fill('hidden')));
    const [hiddenBoard, setHiddenBoard] = useState(null); // Used for simulator
    const [selectedBrush, setSelectedBrush] = useState(COLORS.blue.value);
    const [solution, setSolution] = useState(null);

    const t = translations[language];

    // Re-run solver when board or mode changes
    useEffect(() => {
        let currentBoard = board.map(row => row.map(cell => {
            if (typeof cell === 'number') return cell;
            if (cell === 'hidden') return 'hidden';
            if (cell === 'purple') return 'purple';
            if (cell === 'red') return 'red';
            // Map string names back to values for chest if needed:
            if (mode === 'chest') {
                if (cell === 0) return 'blue';
                if (cell === 1) return 'cyan';
                if (cell === 2) return 'green';
                if (cell === 3) return 'yellow';
                if (cell === 4) return 'orange';
                return cell;
            }
            return cell;
        }));

        if (mode === 'chest' && typeof currentBoard[0][0] === 'number') {
            // Convert any leftover numbers from quest into string colors for chest
            const numToColor = ['blue', 'cyan', 'green', 'yellow', 'orange'];
            currentBoard = currentBoard.map(row => row.map(c => typeof c === 'number' ? numToColor[c] : c));
        }

        if (mode === 'quest') {
            try {
                const res = solveOuroquest(currentBoard);
                setSolution(res);
            } catch (e) {
                console.error(e);
                setSolution({ error: e.message });
            }
        } else {
            try {
                const res = solveOurochest(currentBoard);
                setSolution(res);
            } catch (e) {
                setSolution({ error: e.message });
            }
        }
    }, [board, mode]);

    const startSimulator = (m = mode) => {
        setIsSimulator(true);
        setBoard(new Array(5).fill(null).map(() => new Array(5).fill('hidden')));
        if (m === 'quest') {
            setHiddenBoard(generateOuroquestBoard());
        } else {
            setHiddenBoard(generateOurochestBoard());
        }
    };

    const handleCellClick = (r, c) => {
        const newBoard = board.map(row => [...row]);

        if (isSimulator) {
            // In simulator mode, clicking reveals the hidden tile
            if (hiddenBoard && hiddenBoard[r][c]) {
                newBoard[r][c] = hiddenBoard[r][c];
            }
        } else {
            // Toggle hidden if clicking with the same brush (Solver Mode)
            if (newBoard[r][c] === selectedBrush) {
                newBoard[r][c] = 'hidden';
            } else {
                newBoard[r][c] = selectedBrush;
            }
        }
        setBoard(newBoard);
    };

    const clearBoard = () => {
        setBoard(new Array(5).fill(null).map(() => new Array(5).fill('hidden')));
        if (isSimulator) {
            startSimulator(mode); // generate a new board if clearing in simulator
        }
    };

    const getCellStyles = (r, c, cellVal) => {
        let colorObj = Object.values(COLORS).find(c => c.value === cellVal) || COLORS.hidden;

        // Fallback for chest colors stored as strings but evaluated as numbers previously
        if (mode === 'chest') {
            if (typeof cellVal === 'number') {
                const charColor = ['blue', 'cyan', 'green', 'yellow', 'orange'][cellVal];
                colorObj = Object.values(COLORS).find(c => c.value === charColor);
            } else if (typeof cellVal === 'string' && Object.keys(COLORS).includes(cellVal)) {
                // If simulator generated the string names, match them directly to the object name since their 'value' for quest is an int!
                colorObj = COLORS[cellVal];
            }
        }

        const prob = solution?.probabilities?.[r]?.[c] || 0;
        const isTarget = mode === 'quest' ? cellVal === 'purple' : cellVal === 'red';

        let baseClass = `relative w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-lg border-2 border-white/10 transition-all duration-200 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 overflow-hidden`;

        // Find best moves (highest non-100% prob)
        let isBestMove = false;
        if (cellVal === 'hidden' && solution?.probabilities) {
            let maxP = 0;
            solution.probabilities.forEach((row, ir) => row.forEach((p, ic) => {
                if (board[ir][ic] === 'hidden' && p > maxP) maxP = p;
            }));
            if (maxP > 0 && prob === maxP && maxP < 1) isBestMove = true;
        }

        return {
            className: `${baseClass} ${isBestMove && showProbs ? 'ring-4 ring-white ring-offset-2 ring-offset-gray-900 animate-pulse' : ''}`,
            style: { backgroundColor: colorObj.hex },
            prob: cellVal === 'hidden' && prob > 0 && showProbs ? (prob * 100).toFixed(0) + '%' : '',
            perfect: prob === 1 && cellVal === 'hidden' && showProbs
        };
    };

    const currentPallete = mode === 'quest' ? QUEST_COLORS : CHEST_COLORS;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500/30">
            <div className="max-w-5xl mx-auto p-4 sm:p-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-purple-500/20 shadow-xl">
                            <Settings2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">{t.appTitle}</h1>
                            <p className="text-gray-400 font-medium">{t.appSubtitle}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {/* Control Toggles Component */}
                        <div className="bg-gray-800/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 flex gap-2 shadow-xl shrink-0">
                            <button
                                onClick={() => setLanguage(l => l === 'en' ? 'pt' : 'en')}
                                className="px-4 py-2.5 rounded-xl font-bold transition-all text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
                                title={t.language}
                            >
                                <Globe className="w-5 h-5" /> {language.toUpperCase()}
                            </button>
                            <div className="w-px bg-white/10 my-2 mx-1"></div>
                            {!isSimulator ? (
                                <button
                                    onClick={() => startSimulator(mode)}
                                    className="px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    <Gamepad2 className="w-5 h-5" /> {t.simulatorMode}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsSimulator(false);
                                        setBoard(new Array(5).fill(null).map(() => new Array(5).fill('hidden')));
                                        setHiddenBoard(null);
                                        setShowProbs(true);
                                    }}
                                    className="px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg ring-2 ring-white"
                                >
                                    <XCircle className="w-5 h-5" /> {t.exitSimulator}
                                </button>
                            )}
                        </div>

                        {/* Mode Toggles Component */}
                        <div className="bg-gray-800/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 flex gap-2 shadow-xl shrink-0">
                            <button
                                onClick={() => {
                                    setMode('quest');
                                    setSelectedBrush(COLORS.blue.value);
                                    if (isSimulator) {
                                        startSimulator('quest');
                                    } else {
                                        setBoard(new Array(5).fill(null).map(() => new Array(5).fill('hidden')));
                                    }
                                }}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${mode === 'quest' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {t.questMode}
                            </button>
                            <button
                                onClick={() => {
                                    setMode('chest');
                                    setSelectedBrush('blue');
                                    if (isSimulator) {
                                        startSimulator('chest');
                                    } else {
                                        setBoard(new Array(5).fill(null).map(() => new Array(5).fill('hidden')));
                                    }
                                }}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${mode === 'chest' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {t.chestMode}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column - Board */}
                    <div className="lg:col-span-7 flex flex-col items-center">
                        <div className={`glass p-6 sm:p-8 rounded-3xl bg-gray-800/40 relative border-4 transition-colors duration-500 shadow-2xl ${mode === 'quest' ? 'border-purple-500/50 shadow-purple-500/20' : 'border-red-500/50 shadow-red-500/20'}`}>
                            {solution?.error && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg backdrop-blur-md whitespace-nowrap z-10 w-max">
                                    <AlertCircle className="w-5 h-5" /> {solution.error.includes("Contradiction") ? t.errorContradiction : (solution.error.includes("Too many") ? t.errorToomany : t.errorNotenough)}
                                </div>
                            )}
                            {solution?.validBoards === 0 && !solution?.error && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg backdrop-blur-md whitespace-nowrap z-10 w-max">
                                    <AlertCircle className="w-5 h-5" /> {t.errorContradiction}
                                </div>
                            )}
                            <div className="grid grid-cols-5 gap-3 sm:gap-4">
                                {board.map((row, r) => row.map((cellVal, c) => {
                                    const { className, style, prob, perfect } = getCellStyles(r, c, cellVal);
                                    // Disable center button for Ourochest
                                    const isDisabled = mode === 'chest' && r === 2 && c === 2;
                                    return (
                                        <div
                                            key={`${r}-${c}`}
                                            className={`${className} ${isDisabled ? 'opacity-20 cursor-not-allowed' : ''}`}
                                            style={isDisabled ? { backgroundColor: '#303030' } : style}
                                            onClick={() => !isDisabled && handleCellClick(r, c)}
                                        >
                                            {/* Inner Glass Highlight */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none mix-blend-overlay"></div>

                                            {/* Overlay Prob text */}
                                            {prob && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-full">
                                                    <span className={`font-black text-sm sm:text-lg flex items-center justify-center ${perfect ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white'}`}>
                                                        {prob}
                                                    </span>
                                                </div>
                                            )}

                                            {/* 100% target marker */}
                                            {perfect && (
                                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-900 border-box">
                                                    !
                                                </div>
                                            )}

                                            {mode === 'chest' && r === 2 && c === 2 && (
                                                <span className="absolute text-white/50 font-bold text-xs">X</span>
                                            )}
                                        </div>
                                    )
                                }))}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between w-full max-w-md px-4 gap-4">
                            <div className="text-gray-400 font-medium">{t.validStates}: <span className="text-white font-bold">{solution?.validBoards ?? 0}</span></div>

                            <div className="flex gap-2">
                                {isSimulator && (
                                    <button
                                        onClick={() => setShowProbs(!showProbs)}
                                        className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl transition-all ${showProbs ? 'text-teal-400 hover:bg-teal-400/10' : 'text-gray-400 hover:bg-gray-400/10'}`}
                                        title={t.toggleProbs}
                                    >
                                        {showProbs ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                )}
                                <button
                                    onClick={clearBoard}
                                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-bold px-4 py-2 hover:bg-red-500/10 rounded-xl"
                                >
                                    <RefreshCw className="w-5 h-5" /> {isSimulator ? t.newGame : t.resetBoard}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Controls */}
                    <div className="lg:col-span-5 relative">
                        <div className="glass p-8 rounded-3xl bg-gray-800/40 sticky top-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-200">
                                <MousePointer2 className="text-purple-400" /> {t.currentBrush}
                            </h3>

                            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 ${isSimulator ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                {currentPallete.map(colorKey => {
                                    const c = COLORS[colorKey];
                                    // Convert chest strings to match values
                                    let displayValue = c.value;
                                    if (mode === 'chest' && typeof displayValue === 'number') {
                                        displayValue = colorKey; // e.g., 'blue', 'cyan'
                                    }
                                    const isSelected = selectedBrush === displayValue;

                                    return (
                                        <button
                                            key={colorKey}
                                            onClick={() => setSelectedBrush(displayValue)}
                                            className={`flex flex-col items-center gap-3 p-3 rounded-2xl transition-all ${isSelected ? 'bg-white/10 ring-2 ring-white scale-105 shadow-xl' : 'hover:bg-white/5 hover:scale-105 opacity-80'}`}
                                        >
                                            <div className="w-8 h-8 rounded-full shadow-inner border border-white/20" style={{ backgroundColor: c.hex }}></div>
                                            <span className="text-xs font-bold text-center leading-tight truncate w-full">{c.name}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="bg-gray-900/50 rounded-2xl p-5 border border-white/5">
                                <h4 className="font-bold text-gray-300 mb-2">{t.instructionsTitle}</h4>
                                <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                                    {(isSimulator ? t.instructionsSimulator : (mode === 'quest' ? t.instructionsQuestSolver : t.instructionsChestSolver)).map((text, idx) => (
                                        <li key={idx} dangerouslySetInnerHTML={{ __html: text.replace('100%', '<strong>100%</strong>') }}></li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default App;
