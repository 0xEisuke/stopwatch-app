// src/utils/fibonacciGrid.js
export function fibonacciSphere(samples = 0) {
    let points = [];
    const phi = Math.PI * (3. - Math.sqrt(5.));  // 黄金角度

    for (let i = 0; i < samples; i++) {
        if (i == 0) {
            points.push([0, 1, 0]);
            continue;
        }
        else
        {
        const y = 1 - (i / (samples - 1)) * 2;  // y座標は1から-1まで
        const radius = Math.sqrt(1 - y * y);  // y座標での半径

        const theta = phi * i;  // 黄金角度の増分

        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        points.push([x, y, z]);

        }
    }
    return points;
}