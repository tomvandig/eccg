
export function MakeEntity(name)
{
    return {
        name,
        isEntity: true
    };
}

export function MakeComponent(name, value)
{
    return {
        name,
        value,
        isComponent: true
    };
}

export class eccg
{
    composeGraph = {};

    Compose(entity, object)
    {
        if (object.isComponent || object.isEntity)
        {
            if (!this.composeGraph[entity.name])
            {
                this.composeGraph[entity.name] = [];
            }
            this.composeGraph[entity.name].push(object);
        }
        else
        {
            throw new Error(`Unknown object`);
        }
    }

    QueryEntity(name)
    {
        console.log(`query entity ${name}`);
        let result = this.composeGraph[name];
        return result ? result : [];
    }

    Query(entity)
    {
        console.log(`query ${entity.name}`);
        let parts = entity.name.split(".");

        if (parts.length === 1)
        {
            return this.QueryEntity(parts[0]);
        }

        let last = parts[parts.length - 1];

        if (last === "*")
        {
            let prev = parts[parts.length - 2];
            let prevCompose = this.QueryEntity(prev);

            console.log(`expand...`);
            let result = [];

            prevCompose.forEach(element => {
                if (element.isEntity)
                {
                    result = [...result, ...this.Query(MakeEntity(`${prev}.${element.name}`))];
                }
            });

            let tail = parts.slice(0, parts.length - 1).join(".");
            result = [...result, ...this.Query(MakeEntity(tail))];
            
            console.log(`...end expand`);


            return result;
        }

        let tail = parts.slice(0, parts.length - 1).join(".");

        return [...this.QueryEntity(last), ...this.QueryEntity(entity.name)];
    }
}