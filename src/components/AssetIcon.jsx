export default function AssetIcon({url, className = ''}) {
    return (
        <span className={`rounded-full bg-contain bg-no-repeat bg-center bg-gray-100 ${className}`}
              style={{
                  backgroundImage: `url(${url})`,
        }}
        ></span>
    );
}
