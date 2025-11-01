export async function getStreamWsUrl(deviceId: number | string): Promise<string> {

    //获取解码后的ws地址
    const resp = await fetch(`http://192.168.31.120:9999/api/stream/${deviceId}`);
    if (!resp.ok) throw new Error('设备不存在或后端出错');
    const { wsUrl } = await resp.json();
    // 如果 wsUrl 已经是 ws 开头，直接返回，否则拼接完整地址
    if (wsUrl.startsWith('ws')) {
        return wsUrl;
    }
    // 自动适配当前主机名，避免写死 localhost
    const host = "192.168.31.120";
    return `ws://${host}:9998${wsUrl}`;
}