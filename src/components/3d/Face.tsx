export const Face = () => {
    const eyeColor = "#333333";
    const mouthColor = "#333333";

    return (
        // ブロックの上面(Y=0.5)からほんの少し上(0.501)に配置し、
        // 手前側(Z=0.2)に寄せて、こちらを向くように回転
        <group position={[0, 0.501, 0.2]}>
            {/* 左目 */}
            <mesh position={[-0.2, 0, 0]}>
                {/* ジオメトリを軽くするため分割数(segments)を少なめに設定 */}
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshStandardMaterial color={eyeColor} roughness={0.8} />
            </mesh>
            {/* 右目 */}
            <mesh position={[0.2, 0, 0]}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshStandardMaterial color={eyeColor} roughness={0.8} />
            </mesh>
            {/* 口 (にっこり) - 半円状のトーラス(ドーナツ型)で表現 */}
            <mesh position={[0, -0.05, -0.05]} rotation={[0.3, 0, 0]}>
                {/* radius, tube, radialSegments, tubularSegments, arc */}
                <torusGeometry args={[0.12, 0.05, 8, 16, Math.PI]} />
                <meshStandardMaterial color={mouthColor} roughness={0.8} />
            </mesh>
        </group>
    );
};