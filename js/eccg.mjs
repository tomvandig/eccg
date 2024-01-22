
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
    invComposeGraph = {};
    componentTypeToEntity = {};

    Compose(entity, object)
    {
        if (object.isComponent || object.isEntity)
        {
            if (!this.composeGraph[entity.name])
            {
                this.composeGraph[entity.name] = [];
            }
            this.composeGraph[entity.name].push(object);

            if (object.isEntity)
            {
                if (!this.invComposeGraph[object.name])
                {
                    this.invComposeGraph[object.name] = [];
                }

                this.invComposeGraph[object.name].push(entity.name);
            }

            if (object.isComponent)
            {
                if (!this.componentTypeToEntity[object.name])
                {
                    this.componentTypeToEntity[object.name] = [];
                }
                this.componentTypeToEntity[object.name].push(entity.name);
            }
        }
        else
        {
            throw new Error(`Unknown object`);
        }
    }

    ShallowQueryEntity(name)
    {
        console.log(`query entity ${name}`);
        let result = this.composeGraph[name];
        return result ? result : [];
    }

    QueryEntity(entity)
    {
        console.log(`query ${entity.name}`);
        let parts = entity.name.split(".");

        if (parts.length === 1)
        {
            return this.ShallowQueryEntity(parts[0]);
        }

        let last = parts[parts.length - 1];

        if (last === "*")
        {
            let tail = parts.slice(0, parts.length - 1).join(".");
            let prev = parts[parts.length - 2];
            let prevCompose = prev == tail ? this.ShallowQueryEntity(prev)
                            : [...this.ShallowQueryEntity(prev), ...this.ShallowQueryEntity(tail)];

            console.log(`expand...`);
            let result = [];

            prevCompose.forEach(element => {
                if (element.isEntity)
                {
                    result = [...result, ...this.QueryEntity(MakeEntity(`${prev}.${element.name}.*`))];
                    result.push(element);
                }
                else
                {
                    result.push(element);
                }
            });

            console.log(`...end expand`);

            return result;
        }

        return [...this.ShallowQueryEntity(last), ...this.ShallowQueryEntity(entity.name)];
    }

    FindAllParentsInComposeGraph(entity, entityPath, result)
    {
        result.push(entityPath);

        let invSet = this.invComposeGraph[entity];

        if (invSet)
        {
            invSet.forEach((inv) => {
                let virtual = `${inv}.${entityPath}`;

                this.FindAllParentsInComposeGraph(inv, virtual, result)
            })
        }
    }

    QueryComponent(component)
    {
        let directSet = this.componentTypeToEntity[component.name];

        if (!directSet) return [];

        let result = [];

        for (let i = 0; i < directSet.length; i++)
        {
            let direct = directSet[i];

            this.FindAllParentsInComposeGraph(direct, direct, result);
        }

        return result;
    }

    Query(obj)
    {
        if (obj.isEntity)
        {
            return this.QueryEntity(obj);
        }
        else if (obj.isComponent)
        {
            return this.QueryComponent(obj);
        }
        else
        {
            throw new Error(`Unsupported`);
        }
    }
}