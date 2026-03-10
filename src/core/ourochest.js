export function solveOurochest(board) {
    let validCount = 0;
    let probs = new Array(5).fill(0).map(() => new Array(5).fill(0));

    for (let rr = 0; rr < 5; rr++) {
        for (let cc = 0; cc < 5; cc++) {
            if (rr === 2 && cc === 2) continue;

            let isValid = true;
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    let cell = board[r][c];
                    if (!cell || cell === 'hidden') continue;

                    let dr = Math.abs(r - rr);
                    let dc = Math.abs(c - cc);
                    let isStar = (dr === 0 || dc === 0 || dr === dc);
                    let isAdjacent = Math.max(dr, dc) === 1;
                    let isDiagonal = dr === dc && dr > 0;
                    let isCross = (dr === 0 || dc === 0) && (dr > 0 || dc > 0);

                    if (cell === 'red') {
                        if (r !== rr || c !== cc) isValid = false;
                    } else if (cell === 'orange') {
                        if (!isAdjacent) isValid = false;
                    } else if (cell === 'yellow') {
                        if (!isDiagonal) isValid = false;
                    } else if (cell === 'green') {
                        if (!isCross) isValid = false;
                    } else if (cell === 'cyan') {
                        if (!isStar) isValid = false;
                    } else if (cell === 'blue') {
                        if (isStar) isValid = false;
                    }
                }
            }

            if (isValid) {
                let spaceAdjacent = 0, existingOranges = 0;
                let spaceDiagonal = 0, existingYellows = 0;
                let spaceCross = 0, existingGreens = 0;

                for (let r = 0; r < 5; r++) {
                    for (let c = 0; c < 5; c++) {
                        let cell = board[r][c];
                        let dr = Math.abs(r - rr);
                        let dc = Math.abs(c - cc);

                        if (Math.max(dr, dc) === 1) {
                            if (cell === 'orange') existingOranges++;
                            else if (!cell || cell === 'hidden') spaceAdjacent++;
                        }

                        if (dr === dc && dr > 0) {
                            if (cell === 'yellow') existingYellows++;
                            else if (!cell || cell === 'hidden') spaceDiagonal++;
                        }

                        if ((dr === 0 || dc === 0) && (dr > 0 || dc > 0)) {
                            if (cell === 'green') existingGreens++;
                            else if (!cell || cell === 'hidden') spaceCross++;
                        }
                    }
                }

                if (existingOranges + spaceAdjacent < 2) isValid = false;
                if (existingYellows + spaceDiagonal < 3) isValid = false;
                if (existingGreens + spaceCross < 4) isValid = false;
            }

            if (isValid) {
                validCount++;
                probs[rr][cc] = 1;
            }
        }
    }

    if (validCount > 0) {
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                probs[r][c] = probs[r][c] / validCount;
            }
        }
    }

    return {
        validBoards: validCount,
        probabilities: probs
    }
}
