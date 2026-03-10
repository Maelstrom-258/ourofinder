function getCombinations(array, size) {
    const result = [];
    function combine(start, path) {
        if (path.length === size) {
            result.push([...path]);
            return;
        }
        for (let i = start; i < array.length; i++) {
            path.push(array[i]);
            combine(i + 1, path);
            path.pop();
        }
    }
    combine(0, []);
    return result;
}

export function solveOuroquest(board) {
    let purplesToFind = 4;
    let unknowns = [];
    let knowns = [];

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            let cell = board[r][c];
            if (cell === 'purple') {
                purplesToFind--;
            } else if (cell === null || cell === undefined || cell === 'hidden') {
                unknowns.push({ r, c });
            } else if (typeof cell === 'number') {
                knowns.push({ r, c, val: cell });
            }
        }
    }

    if (purplesToFind < 0) return { error: "Too many purples", validBoards: 0, probabilities: board.map(row => row.map(() => 0)) };
    if (unknowns.length < purplesToFind) return { error: "Not enough space", validBoards: 0, probabilities: board.map(row => row.map(() => 0)) };

    let validCount = 0;
    let purpleCounts = new Array(25).fill(0);

    let combos = getCombinations(unknowns, purplesToFind);

    for (let combo of combos) {
        let isValid = true;
        for (let known of knowns) {
            let adjacentPurples = 0;

            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    if (board[r][c] === 'purple' && Math.max(Math.abs(r - known.r), Math.abs(c - known.c)) === 1) {
                        adjacentPurples++;
                    }
                }
            }

            for (let p of combo) {
                if (Math.max(Math.abs(p.r - known.r), Math.abs(p.c - known.c)) === 1) {
                    adjacentPurples++;
                }
            }

            if (adjacentPurples !== known.val) {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            validCount++;
            for (let p of combo) {
                purpleCounts[p.r * 5 + p.c]++;
            }
        }
    }

    let resultGrid = new Array(5).fill(0).map(() => new Array(5).fill(0));
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (board[r][c] === 'purple') resultGrid[r][c] = 1;
            else if (typeof board[r][c] === 'number') resultGrid[r][c] = 0;
        }
    }

    if (validCount > 0) {
        for (let i = 0; i < unknowns.length; i++) {
            let u = unknowns[i];
            let p = purpleCounts[u.r * 5 + u.c] / validCount;
            resultGrid[u.r][u.c] = p;
        }
    }

    return {
        validBoards: validCount,
        probabilities: resultGrid
    };
}
