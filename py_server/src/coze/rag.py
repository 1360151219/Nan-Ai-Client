from .app import coze


def list_datasets():
    """List all datasets."""
    return coze.datasets.list(space_id="7532480716039438379").items

def get_dataset(dataset_id: str):
    """Get a dataset by ID."""
    return coze.files.retrieve


if __name__ == "__main__":
    datasets = list_datasets()
    print(datasets)
