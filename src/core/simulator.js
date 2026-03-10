export function generateOuroquestBoard() {
    const board = new Array(5).fill(null).map(() => new Array(5).fill(null));

    let purplesPlaced = 0;
    while (purplesPlaced < 4) {
        let r = Math.floor(Math.random() * 5);
        let c = Math.floor(Math.random() * 5);
        if (board[r][c] !== 'purple') {
            board[r][c] = 'purple';
            purplesPlaced++;
        }
    }

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (board[r][c] === 'purple') continue;

            let adjacentPurples = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
                        if (board[nr][nc] === 'purple') adjacentPurples++;
                    }
                }
            }
            board[r][c] = adjacentPurples > 4 ? 4 : adjacentPurples;
        }
    }

    return board;
}

export function generateOurochestBoard() {
    const board = new Array(5).fill(null).map(() => new Array(5).fill(null));
    const availableEmpty = [];

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (r !== 2 || c !== 2) availableEmpty.push({ r, c });
        }
    }


    let rr, cc;
    const redIndex = Math.floor(Math.random() * availableEmpty.length);
    const redTarget = availableEmpty.splice(redIndex, 1)[0];
    rr = redTarget.r;
    cc = redTarget.c;
    board[rr][cc] = 'red';

    const validAdjacents = availableEmpty.filter(p => Math.abs(p.r - rr) <= 1 && Math.abs(p.c - cc) <= 1 && Math.max(Math.abs(p.r - rr), Math.abs(p.c - cc)) === 1);
    for (let i = 0; i < 2; i++) {
        if (validAdjacents.length > 0) {
            let idx = Math.floor(Math.random() * validAdjacents.length);
            let p = validAdjacents.splice(idx, 1)[0];
            board[p.r][p.c] = 'orange';
            const aIdx = availableEmpty.findIndex(e => e.r === p.r && e.c === p.c);
            if (aIdx >= 0) availableEmpty.splice(aIdx, 1);
        }
    }


    const validDiagonals = availableEmpty.filter(p => Math.abs(p.r - rr) === Math.abs(p.c - cc) && Math.abs(p.r - rr) > 0);
    for (let i = 0; i < 3 && validDiagonals.length > 0; i++) {
        let idx = Math.floor(Math.random() * validDiagonals.length);
        let p = validDiagonals.splice(idx, 1)[0];
        board[p.r][p.c] = 'yellow';
        const aIdx = availableEmpty.findIndex(e => e.r === p.r && e.c === p.c);
        if (aIdx >= 0) availableEmpty.splice(aIdx, 1);
    }

    const validCrosses = availableEmpty.filter(p => (p.r === rr || p.c === cc) && (p.r !== rr || p.c !== cc));
    for (let i = 0; i < 4 && validCrosses.length > 0; i++) {
        let idx = Math.floor(Math.random() * validCrosses.length);
        let p = validCrosses.splice(idx, 1)[0];
        board[p.r][p.c] = 'green';
        const aIdx = availableEmpty.findIndex(e => e.r === p.r && e.c === p.c);
        if (aIdx >= 0) availableEmpty.splice(aIdx, 1);
    }


    for (let p of availableEmpty) {
        let isStar = (Math.abs(p.r - rr) === 0 || Math.abs(p.c - cc) === 0 || Math.abs(p.r - rr) === Math.abs(p.c - cc));
        if (isStar) {
            board[p.r][p.c] = 'cyan';
        } else {
            board[p.r][p.c] = 'blue';
        }
    }

    return board;
}
