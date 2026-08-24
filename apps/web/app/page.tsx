import { appConfig } from "@upkick/config";
import { env } from "@upkick/env/server";

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="text-2xl font-bold">{appConfig.name}</h1>
          <p className="text-muted-foreground">{appConfig.description}</p>
          <p className="text-xs text-muted-foreground">
            Environment: <span className="font-mono">{env.NODE_ENV}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Database URL: <span className="font-mono">{env.DATABASE_URL}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Better Auth Secret: <span className="font-mono">{env.BETTER_AUTH_SECRET}</span>
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">URLs</h2>
          <ul className="list-disc pl-6">
            <li>
              Marketing:{" "}
              <a
                href={appConfig.urls.marketing}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {appConfig.urls.marketing}
              </a>
            </li>
            <li>
              App:{" "}
              <a
                href={appConfig.urls.app}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {appConfig.urls.app}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Support</h2>
          <p>
            Email:{" "}
            <a href={`mailto:${appConfig.support.email}`} className="text-primary underline">
              {appConfig.support.email}
            </a>
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-lg font-semibold">Features</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(appConfig.features).map(([feature, isEnabled]) => (
            <span
              key={feature}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                isEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {feature}: {isEnabled ? "Enabled" : "Disabled"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
