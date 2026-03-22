export function enrichServices(services, incidents) {
  return services.map((service) => ({
    ...service,
    incidents: incidents.filter((i) => i.affectedServiceIds.includes(service.id)),
  }));
}

export function timelineRange(incidents) {
  if (!incidents.length) {
    const now = new Date();
    return { min: new Date(now - 30 * 24 * 60 * 60 * 1000), max: now };
  }
  const starts = incidents.map((i) => new Date(i.startedAt).getTime());
  const ends = incidents.map((i) =>
    i.resolvedAt ? new Date(i.resolvedAt).getTime() : Date.now()
  );
  return { min: new Date(Math.min(...starts)), max: new Date(Math.max(...ends)) };
}
