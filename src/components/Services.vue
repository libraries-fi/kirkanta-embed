<template>
  <div>
    <h2 class="sr-only">Services</h2>
    <template v-for="group of groups">
      <h3>{{ group.title }}</h3>
      <ul>
        <li v-for="(service, i) of group.services">
          <span @click="expandedService = group.title + i" :class="service.description ? 'link text-primary' : false">
            <template v-if="service.custom_name">{{ service.custom_name }}</template>
            <template v-else>{{ service.name }}</template>
          </span>
          <template v-if="service.description">
            <p class="mr-2 p-1 border" v-if="expandedService == group.title + i">{{ service.description }}</p>
          </template>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
  const service_group_labels = new Map([
    ["service", "Services"],
    ["room", "Rooms"],
    ["hardware", "Hardware"],
    ["collection", "Collections"],
    ["web_service", "Web services"],
  ]);

  export default {
    props: ["services"],
    data: () => ({
      expandedService: null
    }),
    computed: {
      groups() {
        let groups = {};

        for (let [i, service] of this.services.entries()) {
          if (!groups[service.type]) {
            groups[service.type] = {
              title: service_group_labels.get(service.type),
              services: [service]
            };
          } else {
            groups[service.type].services.push(service);
          }
        }

        for (let gid of Object.keys(groups)) {
          groups[gid].services.sort((a, b) => {
            let va = a.custom_name || a.name;
            let vb = b.custom_name || b.name;

            // Aside from Russian this is safe here, but we don't need to support Russian in widgets.
            return va.localeCompare(vb, 'fi');
          });
        }

        return groups;
      }
    }
  };
</script>

<style lang="scss">
  .link {
    cursor: pointer;
  }
</style>
